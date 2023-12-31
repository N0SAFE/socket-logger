import { Socket, Server as _Server } from 'socket.io'
import Connection from './Connection'
import { AdvancedSocketMethods } from '@/shared/types'
import type { IsHttpServer, IsServerInfo, ServerOptions } from './types'
import { Server as HttpServer, createServer } from 'http'
import Client from '@/client/utils/Client'

export default class Server extends _Server implements AdvancedSocketMethods {
  public port: number | undefined
  public connections = new Set<Connection>()
  public opened = false
  public p = '/'
  protected onConnectionFn: (connection: Connection) => void = () => {
    this.emit('connection', {
      isCluster: false,
    })
  }

  constructor(...args: [] | [Partial<IsServerInfo>] | [number | IsHttpServer] | [number | IsHttpServer, Partial<IsServerInfo>]) {
    let _args = args as any[]
    let srv: number | undefined | IsHttpServer
    if (typeof args[0] === 'number' || args[0] instanceof HttpServer) {
      srv = args[0]
      _args = args.slice(1)
    }
    if (_args.length === 0) {
      _args = [{}]
    }
    if (_args[0].serverOptions) {
      _args[0] = { ..._args[0], ..._args[0].serverOptions }
    }
    let opts = _args[0] as Partial<ServerOptions>
    opts.path =
      opts.path?.[0] === '/'
        ? opts.path
        : '/' + (typeof opts.path === 'string' ? opts.path : '')
    opts.cors = opts.cors || {
      origin: '*',
      methods: ['GET', 'POST'],
    } 
    opts.allowRequest = opts.allowRequest || ((_req, _fn) => {
      _fn(null, true)
    })
    super(opts)
    this.p = opts.path
    if (srv) {
      this.open(srv)
    }

    this.on('connection', (socket: Socket) => {
      const connection = new Connection(this, socket)
      this.connections.add(connection)
      this.onConnectionFn(connection)
      socket.on('disconnect', () => {
        this.connections.delete(connection)
      })
    })
  }

  public onConnection(callback: (connection: Connection) => any) {
    this.on('connection', (socket: Socket) => {
      const connection = this.findConnection(
        (c) => c.socket === socket,
      ) as unknown as Connection
      callback(connection)
    })
  }

  public open(srv: number | IsHttpServer) {
    this.opened = true
    if (typeof srv === 'number') {
      this.port = srv
    } else if (srv instanceof HttpServer) {
      const httpServer = srv as IsHttpServer
      this.port = httpServer.port
    }
    this.listen(srv)
  }

  public awaitFor(eventName, _callback: (...args) => boolean = () => true) {
    const callback = function (...args) {
      return _callback(...args)
    }

    return new Promise((resolve) => {
      this.on(eventName, (data) => {
        if (callback(data)) {
          resolve(data)
          this.off(eventName, callback)
        }
      })
    })
  }

  public request(ev: string, ...args: any) {
    this.emit(ev, ...args)
    return this.awaitFor(ev)
  }

  public findConnection(
    search: (
      connection: Connection,
      index: number,
      obj: Connection[],
    ) => boolean,
  ): Connection | undefined {
    return Array.from(this.connections).find(search)
  }

  public close() {
    this.opened = false
    this.port = undefined
    super.close()
  }

  public connect() {
    return new Client({
      port: this.port,
      host: 'localhost',
      path: this.p,
      protocol: 'http',
    })
  }

  static createHttpServer(port?: number): IsHttpServer {
    const httpServer = createServer() as IsHttpServer
    const listen = httpServer.listen
    httpServer.listen = (...args) => {
      if (typeof args[0] === 'number') {
        httpServer.port = args[0] as number
      } else if (typeof args[0] === 'object') {
        httpServer.port = (args[0] as any).port
      }
      listen.call<HttpServer, any[], IsHttpServer>(httpServer, ...args)
      return httpServer
    }
    if (port) {
      httpServer.listen(port)
      httpServer.port = port as number
    }
    httpServer.setMaxListeners(0)
    return httpServer
  }
}
