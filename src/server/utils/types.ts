
import type { Server as _HttpServer } from 'http'
import { ServerOptions as SocketIoServerOptions } from 'socket.io'

export type IsHttpServer = _HttpServer & { port?: number | undefined }
export type IsServerInfo =
  ({
      port: number
      path?: string | undefined
      httpServer?: never | undefined
      serverOptions?: Partial<ServerOptions> | undefined
    }
  | {
      httpServer: IsHttpServer
      path?: string | undefined
      port?: never | undefined
      serverOptions?: Partial<ServerOptions> | undefined
    })
    & Partial<ServerOptions>

export type ServerOptions = Omit<SocketIoServerOptions, "path"> & { path: string } // replace the path type with a undefinabled string