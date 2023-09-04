import Server from './Server'
import { Socket } from 'socket.io'

export default class Connection {
  public server: Server
  public socket: Socket
  constructor(...args: [Server, Socket] | [Connection]) {
    if (args.length === 1) {
      const connection = args[0]
      this.server = connection.server
      this.socket = connection.socket
      return
    } else {
      const [server, socket] = args
      if (!(server instanceof Server) || !(socket instanceof Socket)) {
        {
          throw new Error('invalid argument')
        }
      }
      this.server = server
      this.socket = socket
    }
  }
}
