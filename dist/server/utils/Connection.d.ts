import Server from './Server';
import { Socket } from 'socket.io';
export default class Connection {
    server: Server;
    socket: Socket;
    constructor(...args: [Server, Socket] | [Connection]);
}
//# sourceMappingURL=Connection.d.ts.map