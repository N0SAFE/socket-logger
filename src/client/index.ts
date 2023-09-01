import { spawn, ChildProcessWithoutNullStreams } from 'child_process'
import clc from 'cli-color'
import LoggerWriterClient, { WriterGuard } from './writer.socker.io'
import LoggerReaderClient, { ReaderGuard } from './reader.socket.io'

export function createAdminReader() {
  return undefined
}

export function createReader(
  {
    port,
    host,
    protocol = 'http',
    path = '',
    space = 'default',
    keepAlive = true,
    timeout = 1000,
  }: {
    port?: number | undefined
    host: string
    protocol?: string
    path?: string
    space?: string
    keepAlive?: boolean
    timeout?: number
  },
  guard?: ReaderGuard,
): LoggerReaderClient {
  return new LoggerReaderClient(
    { port, host, protocol, path },
    { space, keepAlive, timeout },
    guard,
  )
}

export function createWriter(
  {
    port,
    host,
    protocol = 'http',
    path = '',
    space = 'default',
    keepAlive = true,
    timeout = 1000,
  }: {
    port: number
    host: string
    protocol?: string
    path?: string
    space?: string
    keepAlive?: boolean
    timeout?: number
  },
  guard: WriterGuard = {},
): LoggerWriterClient {
  return new LoggerWriterClient(
    { port, host, protocol, path },
    { space, keepAlive, timeout },
    guard,
  )
}

export function createServiceWriter(
  {
    port,
    host,
    protocol = 'http',
    path = '',
    space = 'default',
    keepAlive = true,
    timeout = 1000,
    wait = false,
  }: {
    port: number
    host: string
    protocol?: string
    path?: string
    space?: string
    keepAlive?: boolean
    timeout?: number
    wait?: boolean
  },
  guard: WriterGuard = {},
  { command }: { command: string },
): Promise<{
  writer: LoggerWriterClient
  subProcess: ChildProcessWithoutNullStreams
}> {
  const writer = createWriter(
    { port, host, protocol, path, space, keepAlive, timeout },
    guard,
  )
  if (wait) {
    return new Promise((resolve) => {
      writer.onServerConnect(() => {
        resolve(
          writer
            .awaitFor('info', function (data) {
              return data.code === 'SUBSCRIPTION:ALLOWED'
            })
            .then(function () {
              const subProcess = spawn(command, {
                shell: true,
                stdio: 'pipe',
                env: {
                  ...process.env,
                },
              })
              subProcess.on('exit', (code) => {
                console.log(clc.blue('Process exited with code ' + code))
                writer.emit('data', {
                  type: 'exit',
                  message: 'Process exited with code ' + code,
                  code,
                })
                if (code !== null) {
                  process.exit(code)
                }
              })
              subProcess.stdout.on('data', (data) => {
                writer.emit('data', data.toString())
              })
              return { writer, subProcess }
            }),
        )
      })
    })
  }

  const subProcess = spawn(command, {
    shell: true,
    stdio: 'pipe',
    env: {
      ...process.env,
    },
  })
  subProcess.on('exit', (code) => {
    console.log(clc.blue('Process exited with code ' + code))
    writer.emit('data', {
      type: 'exit',
      message: 'Process exited with code ' + code,
      code,
    })
    if (code !== null) {
      process.exit(code)
    }
  })
  subProcess.stdout.on('data', (data) => {
    writer.emit('data', data.toString())
  })
  return Promise.resolve({ writer, subProcess })
}

export { LoggerReaderClient, LoggerWriterClient }
