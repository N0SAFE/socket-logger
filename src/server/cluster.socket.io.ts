import { AdvancedSet } from '../utils'
import { Connection, Server, Cluster } from './utils'
import clc from 'cli-color'
import type { IsHttpServer, IsServerInfo } from './utils/types'
import type { Space, ConnectionType,  GuardResponse, Guard } from './types'
import { LoggerConnectionSet, SpaceMap, LoggerConnection } from '.'

export const log = (message: string, ...args: any[]) => {
  console.log(`[ ${clc.yellow('SOCKET')} ] ` + message, args)
}

// const reservedSpaces = ['server']
// reservedSpaces

export class LoggerCluster extends Cluster<any, SpaceMap> {
  private readonly adminReader: LoggerConnectionSet = new LoggerConnectionSet()
  constructor(
    clusterInfo: IsServerInfo = { port: 65000, path: '/' },
    serversInfo: IsServerInfo[] = [{ port: 65001, path: '/' }],
    { openOnStart = true }: { openOnStart?: boolean },
    private guard: Guard = {},
  ) {
    super(clusterInfo, serversInfo, { openOnStart: false }, {})

    guard.verifyServerConnection =
      guard.verifyServerConnection || (async () => ({ success: true }))
    guard.verifyServerSubscription =
      guard.verifyServerSubscription || (async () => ({ success: true }))
    guard.verifyClusterConnection =
      guard.verifyClusterConnection || (async () => ({ success: true }))

    this.createServers(
      () => new SpaceMap(),
      ({ server }: { server: Server; store: SpaceMap }) => {
        log(clc.green('creating server on port ' + server.port + server.p))
        server.onConnection(async (connection: Connection) => {
          const response: GuardResponse =
            (await this.guard.verifyServerConnection?.(
              connection,
            )) as GuardResponse

          if (!response.success) {
            // response.message && log(clc.red(response.message))
            connection.socket.emit('error', {
              message: response.message,
              code: 'CONNECTION:NOT:ALLOWED',
            })
            connection.socket.disconnect()
            return
          } else if (response.success && response.message) {
            // log(clc.yellow(response.message))
          }

          const timeout = setTimeout(() => {
            loggerConnection.socket.disconnect()
            // log(
            //   clc.red(
            //     'connection timeout on host ' +
            //       loggerConnection.socket.handshake.headers.host +
            //       ' disconnecting...',
            //   ),
            // )
          }, 10000)

          // log(clc.yellow('new connection waiting for subscribe'))
          const loggerConnection = new LoggerConnection(
            connection.server,
            connection.socket,
          )
          connection.socket.on(
            'subscribe',
            async (data: {
              space: Space
              type: ConnectionType
              token?: string
            }) => {
              clearTimeout(timeout)
              const response: GuardResponse =
                (await this.guard.verifyServerSubscription?.(
                  connection,
                  data,
                )) as GuardResponse

              if (!response.success) {
                // response.message && log(clc.red(response.message))
                connection.socket.emit('error', {
                  message: response.message,
                  code: 'SUBSCRIPTION:NOT:ALLOWED',
                })
                connection.socket.disconnect()
                return
              } else if (response.success && response.message) {
                // log(clc.yellow(response.message))
              }

              connection.socket.emit('info', {
                message: response.message,
                code: 'SUBSCRIPTION:ALLOWED',
              })

              const { space, type } = data

              loggerConnection.space = space
              loggerConnection.type = type

              if (type === 'writer') {
                // log(clc.green('new writer connected on space ' + space))

                const loggerConnectionSet = this.addSpaceToServer(server, space)
                const writerConnectionSet = this.getWritersBySpace(space)
                if (writerConnectionSet.size === 1) {
                  // log(clc.red('writer already connected on space ' + space))
                  loggerConnection.socket.emit('error', {
                    message: 'writer already connected',
                    code: 'WRITER:ALREADY:CONNECTED',
                  })
                }
                loggerConnectionSet.add(loggerConnection)

                this.sendToReadersBySpace(
                  space,
                  {
                    message: 'the writer is connected',
                    code: 'WRITER:CONNECTED',
                  },
                  'info',
                )
                loggerConnection.socket.on('data', (data: any) => {
                  this.sendToReadersBySpace(space, data, 'data')
                })
                loggerConnection.socket.on('error', (data: any) => {
                  this.sendToReadersBySpace(space, data, 'error')
                })
                loggerConnection.socket.on('info', (data: any) => {
                  this.sendToReadersBySpace(space, data, 'info')
                })
                loggerConnection.socket.on('disconnect', () => {
                  this.removeByConnection(loggerConnection)
                })
              } else if (type === 'reader') {
                // log(clc.green('new reader connected on space ' + space))
                const loggerConnectionSet = this.addSpaceToServer(server, space)
                loggerConnectionSet.add(loggerConnection)

                const writerConnectionSet = this.getWritersBySpace(space)
                if (writerConnectionSet.size === 1) {
                  loggerConnection.socket.emit('info', {
                    message: 'writer already connected',
                    code: 'WRITER:ALREADY:CONNECTED',
                  })
                }

                loggerConnection.socket.on('disconnect', () => {
                  this.removeByConnection(loggerConnection)
                })
              } else if (type === 'admin') {
                // log(clc.green('new admin connected on space ' + space))
                this.adminReader.add(loggerConnection)
              }
            },
          )
        })
      },
    )

    this.setRedirectFn(async (connection: Connection) => {
      const response: GuardResponse =
        (await this.guard.verifyClusterConnection?.(
          connection,
        )) as GuardResponse

      if (!response.success) {
        response.message && log(clc.red(response.message))
        connection.socket.emit('error', {
          message: response.message,
          code: 'CONNECTION:NOT:ALLOWED',
        })
        connection.socket.disconnect()
        return
      } else if (response.success && response.message) {
        // log(clc.yellow(response.message))
      }

      // log(
      //   clc.yellow(
      //     'new connection on the cluster waiting for the client to request his server',
      //   ),
      // )

      const loggerConnection = new LoggerConnection(connection)

      const timeout = setTimeout(() => {
        loggerConnection.socket.disconnect()
        log(
          clc.red(
            'connection timeout on host ' +
              loggerConnection.socket.handshake.headers.host +
              ' disconnecting...',
          ),
        )
      }, 10000)

      const promise = new Promise((resolve) => {
        loggerConnection.socket.on('request', (data: { space: Space }) => {
          clearTimeout(timeout)
          const { space } = data
          loggerConnection.space = space
          const server = this.searchServerToUse(space)

          // log(clc.green('new connection redirected to ' + server.port))
          this.redirect(loggerConnection.server, server)
          // log(
          //   clc.yellow(
          //     'waiting for connection on ' + server.port + server.p,
          //   ),
          // )

          resolve({ port: server.port, space })
        })
      })

      return promise
    })

    if (openOnStart) {
      this.open(clusterInfo)
    }
  }

  public open(srv: number | IsHttpServer | IsServerInfo) {
    super.open(srv)
    log('opening cluster on port ' + srv)
    log('waiting for connections...')
    return this
  }

  public getSpaceMapByServer(server: Server): SpaceMap {
    const space = this.servers.get(server)
    if (!space) {
      throw new Error('space map not found')
    }
    return space
  }

  public getLoggerConnectionSetBySpace(space: Space): LoggerConnectionSet {
    const server = this.servers.find((_, value) =>
      value.has((key, _) => {
        _
        return key === space
      }),
    )?.key
    if (!server) {
      throw new Error('server not found')
    }
    const spaceMap = this.getSpaceMapByServer(server)
    const loggerConnectionSet = spaceMap.get(space)
    if (!loggerConnectionSet) {
      return new LoggerConnectionSet()
    }
    return loggerConnectionSet
  }

  public getSpaceByLoggerConnection(
    connection: LoggerConnection,
  ): Space | undefined {
    const server = this.getServerByLoggerConnection(connection)
    if (!server) {
      return
    }
    const spaceMap = this.getSpaceMapByServer(server)
    if (!spaceMap) {
      return
    }
    const space = spaceMap.find((_, value) => value.has(connection))?.key
    return space
  }

  public getServerByLoggerConnection(
    connection: LoggerConnection,
  ): Server | undefined {
    const server = this.servers.find((_, value) =>
      value.has((_, value) => value.has(connection)),
    )?.key
    if (!server) {
      return
    }
    return server
  }

  public getServerBySpace(space: Space): Server | undefined {
    const server = this.servers.find((_, value) => value.has(space))?.key
    return server
  }

  public IsSpaceExists(space: Space) {
    return this.servers.has((_: Server, value: SpaceMap) => value.has(space))
  }

  public deleteSpaceIfEmpty(space: Space) {
    const server = this.getServerBySpace(space)
    if (!server) {
      return
    }
    const loggerConnectionSet = this.getLoggerConnectionSetBySpace(space)
    if (!loggerConnectionSet) {
      return
    }
    if (loggerConnectionSet.size === 0) {
      this.removeSpace(space)
    }
  }

  public removeByConnection(connection: LoggerConnection) {
    const space = this.getSpaceByLoggerConnection(connection)
    if (!space) {
      return
    }
    const connectionsSet = this.getLoggerConnectionSetBySpace(space)
    if (!connectionsSet) {
      return
    }
    log(clc.red(`removing ${connection.type} ` + connection))
    connectionsSet.delete(connection)

    this.deleteSpaceIfEmpty(space)
  }

  public removeWriterBySpace(space: Space) {
    const connectionsSet = this.getLoggerConnectionSetBySpace(space)
    if (!connectionsSet) {
      return
    }

    this.getWritersBySpace(space).forEach((connection) => {
      log(clc.red('removing writer ' + connection))
      connectionsSet.delete(connection)
    })

    this.deleteSpaceIfEmpty(space)
  }

  public removeReadersBySpace(space: Space) {
    const connectionsSet = this.getLoggerConnectionSetBySpace(space)
    if (!connectionsSet) {
      return
    }

    this.getReadersBySpace(space).forEach((connection) => {
      log(clc.red('removing reader ' + connection))
      connectionsSet.delete(connection)
    })

    this.deleteSpaceIfEmpty(space)
  }

  public removeSpace(space: Space) {
    log(clc.red('removing space ' + space))
    const server = this.getServerBySpace(space)
    if (!server) {
      return
    }
    const spaceMap = this.getSpaceMapByServer(server)
    if (!spaceMap) {
      return
    }
    spaceMap.delete(space)
  }

  public removeSpaceByConnection(connection: LoggerConnection) {
    const space = this.getSpaceByLoggerConnection(connection)
    if (!space) {
      return
    }
    const connectionsSet = this.getLoggerConnectionSetBySpace(space)
    if (!connectionsSet) {
      return
    }
    log(clc.red('removing connection ' + connection))
    connectionsSet.delete(connection)
    if (connectionsSet.size === 0) {
      this.removeSpace(space)
    }
  }

  public getWritersBySpace(space: Space): LoggerConnectionSet {
    const connectionsSet = this.getLoggerConnectionSetBySpace(space)
    const writer = connectionsSet.filter(
      (connection) => connection.type === 'writer',
    )
    return writer
  }

  public getReadersBySpace(space: Space): LoggerConnectionSet {
    const connectionsSet = this.getLoggerConnectionSetBySpace(space)
    const readers = connectionsSet.filter(
      (connection) => connection.type === 'reader',
    )
    return readers
  }

  public getAdmins(): LoggerConnectionSet {
    return this.adminReader
  }

  public getAdminsBySpace(space: Space): LoggerConnectionSet {
    const admins = this.getAdmins().filter(
      (connection) => connection.space === space,
    )
    return admins
  }

  public getAdminsByServer(server: Server): LoggerConnectionSet {
    const admins = this.getAdmins().filter(
      (connection) => connection.server === server,
    )
    return admins
  }

  public getAdminsBySpaceAndServer(
    space: Space,
    server: Server,
  ): LoggerConnectionSet {
    const admins = this.getAdmins().filter(
      (connection) =>
        connection.space === space && connection.server === server,
    )
    return admins
  }

  public getAdminsBySpaceOrServer(
    space: Space,
    server: Server,
  ): LoggerConnectionSet {
    const admins = this.getAdmins().filter(
      (connection) =>
        connection.space === space || connection.server === server,
    )
    return admins
  }

  public sendToReadersBySpace(space: Space, data: any, evt = 'data') {
    const readers = this.getReadersBySpace(space)
    const admins = this.getAdminsBySpace(space)
    admins.forEach((connection) => {
      connection.socket.emit('server', {
        type: 'send',
        from: 'writer',
        evt,
        data,
      })
    })
    readers.forEach((connection) => {
      connection.socket.emit(evt, data)
    })
  }

  public sendToWriterBySpace(space: Space, data: any, evt = 'data') {
    const writer = this.getWritersBySpace(space)
    const admins = this.getAdminsBySpace(space)
    admins.forEach((connection) => {
      connection.socket.emit('server', {
        type: 'send',
        from: 'reader',
        evt,
        data,
      })
    })
    writer.forEach((connection) => {
      connection.socket.emit(evt, data)
    })
  }

  public readFromWriterBySpace(
    space: Space,
    callback: (data: any) => void,
    evt = 'data',
  ) {
    const writer = this.getWritersBySpace(space)
    const admins = this.getAdminsBySpace(space)
    writer.forEach((connection) => {
      connection.socket.on(evt, (data) => {
        admins.forEach((connection) => {
          connection.socket.emit('server', {
            type: 'read',
            from: 'writer',
            evt,
            data,
          })
        })
        callback(data)
      })
    })
  }

  public readFromReadersBySpace(
    space: Space,
    callback: (data: any) => void,
    evt = 'data',
  ) {
    const readers = this.getReadersBySpace(space)
    const admins = this.getAdminsBySpace(space)
    readers.forEach((connection) => {
      connection.socket.on(evt, (data) => {
        admins.forEach((connection) => {
          connection.socket.emit('server', {
            type: 'read',
            from: 'reader',
            evt,
            data,
          })
        })
        callback(data)
      })
    })
  }

  // listSpaces() {
  //     return this.spaces.reduce((acc, set, server) => {
  //         acc[server.port] = Array.from(set).map((connection) => connection.id);
  //         return acc;
  //     }, {});
  // }

  public searchServerToUse(space: Space): Server {
    const admins = this.getAdmins()
    const server = this.getServerBySpace(space)
    admins.forEach((connection) => {
      connection.socket.emit('cluster', {
        type: 'log',
        message: 'searching server to use for space ' + space,
      })
    })
    log('searching server to use for space ' + space)
    if (server) {
      return server
    } else {
      const servers = Array.from(this.servers).sort(
        (a: [Server, SpaceMap], b: [Server, SpaceMap]) => a[1].size - b[1].size,
      )
      const server = servers[0][0]
      admins.forEach((connection) => {
        connection.socket.emit('cluster', {
          type: 'log',
          message: 'using server ' + server.port,
        })
      })
      log('using server ' + server.port)
      return server
    }
  }

  public addSpaceToServer(server: Server, space: Space): LoggerConnectionSet {
    const admins = this.getAdmins()
    if (!this.servers.get(server)) {
      admins.forEach((connection) => {
        connection.socket.emit('cluster', {
          type: 'error',
          message: 'server not found',
        })
      })
      throw new Error('server not found')
    }
    if (!this.IsSpaceExists(space)) {
      admins.forEach((connection) => {
        connection.socket.emit('cluster', {
          type: 'log',
          message: 'adding space ' + space + ' to server ' + server.port,
        })
      })
      log(clc.green('adding space ' + space + ' to server ' + server.port))
      this.servers.get(server)?.set(space, new AdvancedSet())
    }
    const connection = this.servers.get(server)?.get(space)
    if (!connection) {
      throw new Error('connection not found')
    }
    return connection
  }
}
