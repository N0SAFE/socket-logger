import { createCluster } from '../../server'
import { program, InvalidArgumentError } from 'commander'

function myParseInt(value) {
  // parseInt takes a string and a radix
  const parsedValue = parseInt(value, 10)
  if (isNaN(parsedValue)) {
    throw new InvalidArgumentError('Not a number.')
  }
  return parsedValue
}

program
  .requiredOption('--port <integer>', 'port number of the server', myParseInt)
  .option('--path <string>', 'path of the server')
  .option('-si, --server-info [string...]', 'servers info << port:?path >>')

program.parse()

const opts = program.opts()
opts.serverInfo = opts.serverInfo.map((serverInfo) => {
  const [port, path] = serverInfo.split(':')
  return { port: parseInt(port), path: path?.trim() || '/' }
})

const options: {
  port: number
  path: string
  serverInfo: { port: number; path?: string }[]
} = opts as any

console.log(options)

createCluster(
  { port: options.port, path: options.path || '/' },
  options.serverInfo,
  { openOnStart: true },
)
// TODO: implement the list space
// TODO: implement the keep alive
// TODO: implement the timeout
