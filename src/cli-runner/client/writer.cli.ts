import { program, InvalidOptionArgumentError } from 'commander'
import { createWriter } from '../../client/index'

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
  .requiredOption('-str, --string <char>', 'string to send')
  .option('-ka, --keep-alive', 'keep the process alive')
  .option('-to, --timeout', 'initial-timeout', myParseInt)

program.parse()

const options: {
  port: number
  host: string
  protocol: string
  path: string
  space: string
  string: string
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

console.log(options)

const client = createWriter(
  {
    port: options.port,
    space: options.space,
    host: options.host,
    protocol: options.protocol,
    path: options.path,
    keepAlive: true,
    timeout: 1000,
  },
  // {
  //     sendRequestPayloadOnServerConnect: (payload) => {
  //         payload.token = "BEARER eyJhbGciOiJSUzI1NiJ9.eyJkYXRhIjp7InVzZXJJZCI6MiwidXNlciI6eyJlbWFpbCI6InNzc2ViaWxsZW1hdGhpc0BnbWFpbC5jb20ifX0sImlhdCI6MTY5MDMyNjM2OSwiZXhwIjoxNjkwMzI2OTY5fQ.QfJn4tGl1veNT6-scHcSjoZONdptebv8nug4tLPqFUMdSrv2MwKAtGZ9rfklNZcHHjJnUz27HajEItii7VvOQExbViFeJlWE3nPqs3aA3lDcOZVvym3J4em3jWEXIvNd-uQPf1rVQjdrbcdQYjP8yOdmqCF9oaTEyvax0AhqMAL1_ZctMwly6c34z8KaSpYvsvVZGXzDPHT1k5LDczUeif73EjRMc7mCcu1PQQhTj8ZU1XFFdIyGMnnUJIp0XXOFo6KvIxmqzzs0v5uYjnJTKoEkZ89HqqiIxQANUKbEbZbP6zauDsSaGsbkYjOzndzVVhOJI9eKfZZkTSefsWfycfnPiEs8iRJChrWC_flMy916STbzol7cYzqVRrY_HYdGtM0enGr3mjfJ65d7W7OcBOAkR2jI0SDxwVxr75Q_W0FGeQ0jjRuYRFNeDl7fwwzMzTKVzSkrfl3-g1mn8vrl_iPMdjLLf7gHerhF9ZgOD-Hfzfk_N2JtTJDS6tgrqqRkLcc8zd5OM8ooXFuBPXnt2Jgud54FBZMLzARrDc4pa5kGOEqxhm6RqOh9Eg2PZaBRfY7HNbQcFok0IZbFx5hREZDrUMXU2yV7dIeTTwS5s0YC_UdQ36TaFMxkhe1mLQrNVmRRCzBJR1Rxaa8b_l-WcwIJD1GguLd6Zbkgai8_7Mc";
  //         return payload;
  //     }
  // }
)

client.emitOnServerConnection('data', async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return [options.string]
})

// TODO: implement the keep alive
// TODO: implement the timeout
// TODO: implement a custom encoder and decoder to handle circular references
