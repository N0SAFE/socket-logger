import Server from './Server'
// import { Server as _Server } from 'socket.io'
import Connection from './Connection'
import { AdvancedMap } from '../../utils'
import type { IsHttpServer, IsServerInfo } from './types'
import { Server as HttpServer } from 'http'

function dummyFunction(...args: any[]) {
  args
}

export default class Cluster<GlobalStore, ServerStore> extends Server {
  public servers: AdvancedMap<Server, ServerStore>
  public httpServerMap: AdvancedMap<number, IsHttpServer> = new AdvancedMap()
  public isOpened = false
  private redirectFn: (connection: Connection) => void = (connection) => {
    // search the server with the lowest number of connections
    const server = this.servers.min((s) => s.connections.size)
    if (!server) {
      throw new Error('no server found')
    }
    this.redirect(connection.server, server.key)
  }
  protected onConnectionFn: (connection: Connection) => void = () => {
    this.emit('connection', {
      isCluster: true,
    })
  }
  
  constructor(
    private readonly clusterInfo: IsServerInfo = { port: 65000, path: '/' },
    private readonly serversInfo: IsServerInfo[] = [{ port: 65001, path: '/' }],
    opts = { openOnStart: true },
    private readonly store = {} as GlobalStore,
  ) {
    super({ path: clusterInfo.path })
    if(opts.openOnStart) {
      this.open(this.clusterInfo)
    }

    this.servers = new AdvancedMap<Server, ServerStore>()
    this.emit('beforeCreateServers')
    dummyFunction(this.store) // this function is called to avoid error on the ts parser for the unused variable store

    super.onConnection((connection: Connection) => {
      this.redirectFn(connection)
    })
  }

  setRedirectFn(callback: (connection) => void) {
    this.redirectFn = callback
  }

  public open(serverInfo: number | IsHttpServer | IsServerInfo) {
    this.emit('beforeOpen')
    if (serverInfo instanceof HttpServer) {
      super.open(
        this.getHttpServer({ httpServer: serverInfo, path: this.p || '/' }),
      )
    } else if (typeof serverInfo === 'number') {
      super.open(this.getHttpServer({ port: serverInfo, path: this.p || '/' }))
    } else {
      super.open(this.getHttpServer(serverInfo))
    }
    this.emit('open')
    this.isOpened = true
    return this
  }

  public close() {
    this.emit('beforeClose')
    super.close()
    this.servers.forEach((_, server) => {
      server.close()
    })
    this.emit('close')
    this.isOpened = false
    return this
  }

  public serverExists(serverInfo: IsServerInfo) {
    if (serverInfo.path) {
      return this.servers.some(
        (s) =>
          (s.port === serverInfo.port ||
            serverInfo.httpServer?.port === s.port) &&
          s.p === serverInfo.path,
      )
    }
    return this.servers.some(
      (server) =>
        server.port === serverInfo.port ||
        server.port === serverInfo.httpServer?.port,
    )
  }

  public findServer(verify: (server: Server, store: ServerStore) => boolean) {
    return this.servers.find(verify)
  }

  public findServerByPort(serverInfo: IsServerInfo) {
    const server = this.findServer((server: Server, _: ServerStore) => {
      _
      return (
        server.port === serverInfo.port ||
        server.port === serverInfo.httpServer?.port
      )
    })
    if (server) {
      return server
    }
    throw new Error('server not found')
  }

  public portIsInRange(serverInfo: IsServerInfo) {
    if (serverInfo.httpServer instanceof HttpServer) {
      return this.serversInfo.some((s) => {
        s.httpServer === serverInfo.httpServer
      })
    }
    return this.serversInfo.some((s) => {
      s.port === serverInfo.port || s.httpServer?.port === serverInfo.port
    })
  }

  public getHttpServer(serverInfo: IsServerInfo): IsHttpServer {
    if (serverInfo.httpServer instanceof HttpServer) {
      if (
        !this.httpServerMap.some(
          (port, httpServer) => httpServer === serverInfo.httpServer,
        )
      ) {
        this.httpServerMap.set(
          serverInfo.httpServer.port as number,
          serverInfo.httpServer,
        )
      }
      return serverInfo.httpServer
    }
    if (this.httpServerMap.has(serverInfo.port as number)) {
      return this.httpServerMap.get(serverInfo.port as number) as IsHttpServer
    }
    const httpServer = Cluster.createHttpServer(serverInfo.port as number)
    this.httpServerMap.set(serverInfo.port as number, httpServer)
    return httpServer
  }

  public pathIsAllowed(serverInfo: IsServerInfo) {
    const s = this.serversInfo.find(
      (s) =>
        s.port === serverInfo.port || s.httpServer?.port === serverInfo.port,
    )
    if (!s) {
      throw new Error('server not found')
    }
    if (!s.path) {
      return true
    }
    return s.path === serverInfo.path
  }

  public redirect(server: Server, serverToRedirect: Server, payload?: any) {
    server.emit('redirect', {
      type: 'redirected',
      data:
        'redirected to port ' +
        serverToRedirect.port +
        (serverToRedirect.p && ' and path ' + serverToRedirect.p),
      path: serverToRedirect.p || '',
      payload: payload,
      ...(serverToRedirect.port === server.port
        ? {}
        : { port: serverToRedirect.port }),
    })
  }

  public addServer(serverInfo: { port: number; path?: string } & any) {
    this.serversInfo.push(serverInfo)
  }

  public createServer(
    serverInfo: IsServerInfo,
    store: ServerStore = {} as ServerStore,
    callback?: ({
      server,
      store,
    }: {
      server: Server
      store: ServerStore
    }) => void,
  ): Server {
    // ! to test
    // ! if the port or the path does not exist add the server to the list and create it
    // ! else verify if the server already exist and return it or create it
    if (
      !this.portIsInRange(serverInfo) && serverInfo.path
        ? !this.pathIsAllowed(serverInfo)
        : true
    ) {
      this.addServer(serverInfo)
    } else if (this.serverExists(serverInfo)) {
      return this.findServerByPort(serverInfo).key
    }
    const server = new Server(this.getHttpServer(serverInfo), serverInfo)
    this.servers.set(server, store)
    callback?.({ server, store })
    return server
  }

  public createServers(
    store: (
      port: number,
      path: string | undefined,
      index: number,
    ) => ServerStore,
    callback?: ({
      server,
      store,
    }: {
      server: Server
      store: ServerStore
    }) => void,
    onServerError: (error: Error, store: ServerStore) => void = () => {
      return undefined
    },
  ) {
    this.serversInfo.forEach(({ port, path, httpServer }, index) => {
      if (httpServer) {
        const Tstore = store(httpServer.port as number, path, index)
        this.createServer({ path, httpServer }, Tstore, callback)
      } else {
        const Tstore = store(port as number, path, index)
        this.createServer({ port: port as number, path }, Tstore, callback)
      }
    })
    onServerError
  }
}
