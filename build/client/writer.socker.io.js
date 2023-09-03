"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cli_color_1 = __importDefault(require("cli-color"));
const utils_1 = require("./utils");
class LoggerWriterClient extends utils_1.Client {
    guard;
    constructor(info, options, guard) {
        super(info);
        this.guard = guard;
        this.guard.sendRequestPayloadOnClusterConnect =
            this.guard.sendRequestPayloadOnClusterConnect || ((payload) => payload);
        this.guard.sendRequestPayloadOnServerConnect =
            this.guard.sendRequestPayloadOnServerConnect || ((payload) => payload);
        this.onClusterConnect(() => {
            console.log(cli_color_1.default.yellow('Cluster detected, waiting for connection...'));
            this.emit('request', this.guard.sendRequestPayloadOnClusterConnect?.({
                type: 'writer',
                space: options.space,
            }));
        });
        this.onServerConnect(() => {
            console.log(cli_color_1.default.green('Connection established'));
            this.request('subscribe', this.guard.sendRequestPayloadOnServerConnect?.({
                type: 'writer',
                space: options.space,
            }));
        });
        this.onDisconnect(() => {
            console.log(cli_color_1.default.red('Disconnected from server'));
        });
    }
}
// const host: string = "localhost";
// new WriterClient({ port: options.port, host, protocol: "http", path: "" });
exports.default = LoggerWriterClient;
//# sourceMappingURL=writer.socker.io.js.map