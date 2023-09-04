"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Server_1 = __importDefault(require("./Server"));
const socket_io_1 = require("socket.io");
class Connection {
    server;
    socket;
    constructor(...args) {
        if (args.length === 1) {
            const connection = args[0];
            this.server = connection.server;
            this.socket = connection.socket;
            return;
        }
        else {
            const [server, socket] = args;
            if (!(server instanceof Server_1.default) || !(socket instanceof socket_io_1.Socket)) {
                {
                    throw new Error('invalid argument');
                }
            }
            this.server = server;
            this.socket = socket;
        }
    }
}
exports.default = Connection;
//# sourceMappingURL=Connection.js.map