import type { Connection } from "./utils"

export type Space = string
export type ConnectionType = 'writer' | 'reader' | 'admin'
export type AsyncGuardResponse = Promise<
  | {
      success: true
      message?: string
    }
  | {
      success: false
      message: string
    }
>
export type GuardResponse =
  | {
      success: true
      message?: string
    }
  | {
      success: false
      message: string
    }
export interface Guard {
    verifyServerConnection?(
      connection: Connection,
    ): AsyncGuardResponse | GuardResponse
    verifyServerSubscription?(
      connection: Connection,
      data: any,
    ): AsyncGuardResponse | GuardResponse
    verifyClusterConnection?(
      connection: Connection,
    ): AsyncGuardResponse | GuardResponse
  }

export type * as utils from './utils'