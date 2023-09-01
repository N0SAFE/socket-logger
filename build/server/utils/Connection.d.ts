import Server from './Server';
export default class Connection {
    server: Server;
    socket: any;
    constructor(...args: [Server, any] | [Connection]);
}
