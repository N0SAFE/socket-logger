import { createReader } from '../../client'
import { program, InvalidOptionArgumentError } from 'commander'

function myParseInt(value) {
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
  .requiredOption('-s, --space <char>', 'space of the process to read')
  .option('-ls, --list-space', 'list all ids', false)
  .option('-ka, --keep-alive', 'keep the process alive')
  .option('-to, --timeout', 'initial-timeout', myParseInt)

program.parse()

const options: {
  port?: number
  host: string
  protocol: string
  path: string
  space: string
  listSpace: boolean
  keepAlive: boolean
  timeout: number
} = {
  ...{
    host: 'localhost',
    protocol: 'http',
    path: '/',
    keepAlive: false,
    timeout: 1000,
  },
  ...(process.env.ARGS_FOR_SOCKET_LOGGER
    ? JSON.parse(process.env.ARGS_FOR_SOCKET_LOGGER)
    : {}),
  ...(program.opts() as any),
}

if (options.listSpace && options.space) {
  console.log("You can't list the space and read it at the same time")
  process.exit(0)
}

console.log(options)

const client = createReader({
  port: options.port,
  space: options.space,
  host: options.host,
  protocol: options.protocol,
  path: options.path,
  keepAlive: true,
  timeout: 1000,
})

client.listenOnServerConnection('data', (data) => {
  process.stdout.write(data.toString())
})

// TODO: implement the list space
// TODO: implement the keep alive
// TODO: implement the timeout
