
import { Server as _HttpServer } from 'http'

export type IsHttpServer = _HttpServer & { port?: number | undefined }
export type IsServerInfo =
  | {
      port: number
      path?: string | undefined
      httpServer?: never | undefined
    }
  | {
      httpServer: IsHttpServer
      path?: string | undefined
      port?: never | undefined
    }