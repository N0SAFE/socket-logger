"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerWriterClient = exports.LoggerReaderClient = exports.createServiceWriter = exports.createWriter = exports.createReader = exports.createAdminReader = void 0;
const child_process_1 = require("child_process");
const cli_color_1 = __importDefault(require("cli-color"));
const writer_socker_io_1 = __importDefault(require("./writer.socker.io"));
exports.LoggerWriterClient = writer_socker_io_1.default;
const reader_socket_io_1 = __importDefault(require("./reader.socket.io"));
exports.LoggerReaderClient = reader_socket_io_1.default;
function createAdminReader() {
    return undefined;
}
exports.createAdminReader = createAdminReader;
function createReader({ port, host, protocol = 'http', path = '', space = 'default', keepAlive = true, timeout = 1000, }, guard) {
    return new reader_socket_io_1.default({ port, host, protocol, path }, { space, keepAlive, timeout }, guard);
}
exports.createReader = createReader;
function createWriter({ port, host, protocol = 'http', path = '', space = 'default', keepAlive = true, timeout = 1000, }, guard = {}) {
    return new writer_socker_io_1.default({ port, host, protocol, path }, { space, keepAlive, timeout }, guard);
}
exports.createWriter = createWriter;
function createServiceWriter({ port, host, protocol = 'http', path = '', space = 'default', keepAlive = true, timeout = 1000, wait = false, }, guard = {}, { command }) {
    const writer = createWriter({ port, host, protocol, path, space, keepAlive, timeout }, guard);
    if (wait) {
        return new Promise((resolve) => {
            writer.onServerConnect(() => {
                resolve(writer
                    .awaitFor('info', function (data) {
                    return data.code === 'SUBSCRIPTION:ALLOWED';
                })
                    .then(function () {
                    const subProcess = (0, child_process_1.spawn)(command, {
                        shell: true,
                        stdio: 'pipe',
                        env: {
                            ...process.env,
                        },
                    });
                    subProcess.on('exit', (code) => {
                        console.log(cli_color_1.default.blue('Process exited with code ' + code));
                        writer.emit('data', {
                            type: 'exit',
                            message: 'Process exited with code ' + code,
                            code,
                        });
                        if (code !== null) {
                            process.exit(code);
                        }
                    });
                    subProcess.stdout.on('data', (data) => {
                        writer.emit('data', data.toString());
                    });
                    return { writer, subProcess };
                }));
            });
        });
    }
    const subProcess = (0, child_process_1.spawn)(command, {
        shell: true,
        stdio: 'pipe',
        env: {
            ...process.env,
        },
    });
    subProcess.on('exit', (code) => {
        console.log(cli_color_1.default.blue('Process exited with code ' + code));
        writer.emit('data', {
            type: 'exit',
            message: 'Process exited with code ' + code,
            code,
        });
        if (code !== null) {
            process.exit(code);
        }
    });
    subProcess.stdout.on('data', (data) => {
        writer.emit('data', data.toString());
    });
    return Promise.resolve({ writer, subProcess });
}
exports.createServiceWriter = createServiceWriter;
__exportStar(require("./utils"), exports);
//# sourceMappingURL=index.js.map