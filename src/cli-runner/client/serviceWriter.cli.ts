import { program, InvalidOptionArgumentError } from 'commander'
import { createServiceWriter } from '../../client/index'
import dotenv from 'dotenv'
dotenv.config()

function myParseInt(value: any): number {
  // parseInt takes a string and a radix
  const parsedValue = parseInt(value, 10)
  if (isNaN(parsedValue)) {
    throw new InvalidOptionArgumentError('Not a number.')
  }
  return parsedValue
}

program
  .option('--port <integer>', 'port number of the server', myParseInt)
  .option('--host <string>', 'host of the server')
  .option('--protocol <string>', 'protocol of the server')
  .option('--path <string>', 'path of the server')
  .requiredOption('-s, --space <char>', 'space of the process to write')
  .requiredOption('-cmd, --command <char>', 'command to execute')
  .option('-ka, --keep-alive', 'keep the process alive')
  .option('-to, --timeout', 'initial-timeout', myParseInt)
  .option('-w, --wait', 'wait for the connection to be ready')

program.parse()

if (process.env.ARGS_FOR_SOCKET_LOGGER) {
  console.log('env: ' + process.env.ARGS_FOR_SOCKET_LOGGER)
}

const options: {
  port: number
  host: string
  protocol: string
  path: string
  space: string
  command: string
  keepAlive: boolean
  timeout: number
  wait: boolean
} = {
  ...{
    host: 'localhost',
    protocol: 'http',
    path: '/',
    keepAlive: false,
    timeout: 1000,
    wait: false,
  },
  ...(process.env.ARGS_FOR_SOCKET_LOGGER
    ? JSON.parse(process.env.ARGS_FOR_SOCKET_LOGGER)
    : {}),
  ...(program.opts() as any),
}

console.log(options)

createServiceWriter(
  {
    port: options.port,
    space: options.space,
    host: options.host,
    protocol: options.protocol,
    path: options.path,
    keepAlive: true,
    timeout: 1000,
    wait: options.wait,
  },
  {
    // sendRequestPayloadOnServerConnect: (payload) => {
    //     payload.token =
    //         "BEARER eyJhbGciOiJSUzI1NiJ9.eyJkYXRhIjp7InVzZXJJZCI6MiwidXNlciI6eyJlbWFpbCI6InNzc2ViaWxsZW1hdGhpc0BnbWFpbC5jb20ifX0sImlhdCI6MTY5MDQwODIzMywiZXhwIjoxNjkwNDA4ODMzfQ.Sqq_4kJGll9kVYZvyWIpux6LC9LEiqjh2HFI333iBztyWCpLpwT64lBe2Tzg1ZK7LXKvmQfubLcYP3XuH5CRNHJ34pymk6skEPo43q2T84FuH6YhjFjzBxprCoSi2KD2bMxOuI0TcHMYmV50vcvqr7izyys2_fjFgWilhPE1Da8MLgA9b2WRO5RJEWgK3yatWFGCZW84ZN2d2DaB7TwvI_FHZzYp9QvCS9A6rNMF80_8Ku4dvXIvZbHygiIfT9exmX-5nBCeSX2PCYN1SY2Txiy4GmjD1kDuje49ZdVwUSA7iXUgCL_dwPmsT5nXkQ-V8h4SwukFh2mdT_ykGmVMMnBOGsm315ZrIODd03i6goMqJxPat4l7Q-SpU2CszliodHPnylyZL0BWE9zTIVoyadqfh4DrqX6dHgjxe8wuyqQohRzREBCcdOdOrumyh8-yA8942H8DYP66H5h38TvWqXCWm_O0-SAdxm8llv7PO_UpCJVWNtJ15X8foFYIwew4CDYHcjo2pAI-2h6vz8DQKlH16pidZj_Ri-4pvXI4Ge5BwJOkSIcwkd-Fs-ZkmEjBYPQCcd8vOhC-uj0_-BeFlhAZ7Fd_hVsl2TWyFwuPFNjVLyt3rqfJre7tgnHHFM6WiCR1PMS-0irC17c47_jv-84CVK-oIThGFQ7qzIzpuVY";
    //     return payload;
    // }
  },
  { command: options.command },
).then(function ({ subProcess }) {
  subProcess.stdout.pipe(process.stdout)
  subProcess.stderr.pipe(process.stderr)
})

// TODO: implement the keep alive
// TODO: implement the timeout
