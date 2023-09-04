
import type { Server as _HttpServer } from 'http'
import type { ServerOptions } from 'socket.io'

export type IsHttpServer = _HttpServer & { port?: number | undefined }
export type IsServerInfo =
  | {
      port: number
      path?: string | undefined
      httpServer?: never | undefined
      serverOptions?: Partial<ServerOptions>
    }
  | {
      httpServer: IsHttpServer
      path?: string | undefined
      port?: never | undefined
      serverOptions?: Partial<ServerOptions>
    }