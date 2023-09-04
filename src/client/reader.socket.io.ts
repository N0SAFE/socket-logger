import { Client } from './utils'
import clc from 'cli-color'
import type { ReaderGuard } from './types'

class LoggerReaderClient extends Client {
  constructor(
    info: any,
    options: { space: string; keepAlive: boolean; timeout: number },
    private readonly guard: ReaderGuard = {},
  ) {
    super(info)

    this.guard.sendRequestPayloadOnClusterConnect =
      this.guard.sendRequestPayloadOnClusterConnect || ((payload) => payload)
    this.guard.sendRequestPayloadOnServerConnect =
      this.guard.sendRequestPayloadOnServerConnect || ((payload) => payload)

    this.onClusterConnect(() => {
      console.log(clc.yellow('Cluster detected, waiting for connection...'))
      this.emit(
        'request',
        this.guard.sendRequestPayloadOnClusterConnect?.({
          type: 'reader',
          space: options.space,
        }),
      )
    })

    this.onServerConnect(() => {
      console.log(clc.green('Connection established'))
      this.emit(
        'subscribe',
        this.guard.sendRequestPayloadOnServerConnect?.({
          type: 'reader',
          space: options.space,
        }),
      )
    })

    this.onDisconnect(() => {
      console.log(clc.red('Disconnected from server'))
    })
  }
}

// const host: string = "localhost";

// new ReaderClient({ port: options.port, host, protocol: "http", path: "" });

export default LoggerReaderClient
