import Server from './Server'

export default class Connection {
  public server: Server
  public socket: any
  constructor(...args: [Server, any] | [Connection]) {
    if (args.length === 1) {
      const connection = args[0]
      this.server = connection.server
      this.socket = connection.socket
      return
    } else {
      const [server, socket] = args
      if (!(server instanceof Server) || typeof socket !== 'object') {
        {
          throw new Error('invalid argument')
        }
      }
      this.server = server
      this.socket = socket
    }
  }
}
