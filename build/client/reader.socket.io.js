"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const cli_color_1 = __importDefault(require("cli-color"));
class LoggerReaderClient extends utils_1.Client {
    guard;
    constructor(info, options, guard = {}) {
        super(info);
        this.guard = guard;
        this.guard.sendRequestPayloadOnClusterConnect =
            this.guard.sendRequestPayloadOnClusterConnect || ((payload) => payload);
        this.guard.sendRequestPayloadOnServerConnect =
            this.guard.sendRequestPayloadOnServerConnect || ((payload) => payload);
        this.onClusterConnect(() => {
            console.log(cli_color_1.default.yellow('Cluster detected, waiting for connection...'));
            this.emit('request', this.guard.sendRequestPayloadOnClusterConnect?.({
                type: 'reader',
                space: options.space,
            }));
        });
        this.onServerConnect(() => {
            console.log(cli_color_1.default.green('Connection established'));
            this.emit('subscribe', this.guard.sendRequestPayloadOnServerConnect?.({
                type: 'reader',
                space: options.space,
            }));
        });
        this.onDisconnect(() => {
            console.log(cli_color_1.default.red('Disconnected from server'));
        });
    }
}
// const host: string = "localhost";
// new ReaderClient({ port: options.port, host, protocol: "http", path: "" });
exports.default = LoggerReaderClient;
//# sourceMappingURL=reader.socket.io.js.map