#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const index_1 = require("@/client/index");
function myParseInt(value) {
    // parseInt takes a string and a radix
    const parsedValue = parseInt(value, 10);
    if (isNaN(parsedValue)) {
        throw new commander_1.InvalidOptionArgumentError('Not a number.');
    }
    return parsedValue;
}
commander_1.program
    .option('--port <integer>', 'port number of the server', myParseInt)
    .option('--host <string>', 'host of the server')
    .option('--protocol <string>', 'protocol of the server')
    .option('--path <string>', 'path of the server')
    .requiredOption('-s, --space <char>', 'space of the process to write')
    .requiredOption('-str, --string <char>', 'string to send')
    .option('-ka, --keep-alive', 'keep the process alive')
    .option('-to, --timeout', 'initial-timeout', myParseInt);
commander_1.program.parse();
const options = {
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
    ...commander_1.program.opts(),
};
// console.log(options)
const client = (0, index_1.createWriter)({
    port: options.port,
    space: options.space,
    host: options.host,
    protocol: options.protocol,
    path: options.path,
    keepAlive: true,
    timeout: 1000,
});
client.emitOnServerConnection('data', async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return [options.string];
});
// TODO: implement the keep alive
// TODO: implement the timeout
// TODO: implement a custom encoder and decoder to handle circular references
//# sourceMappingURL=writer.cli.js.map