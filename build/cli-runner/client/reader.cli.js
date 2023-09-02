#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("../../client");
const commander_1 = require("commander");
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
    .requiredOption('-s, --space <char>', 'space of the process to read')
    .option('-ls, --list-space', 'list all ids', false)
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
if (options.listSpace && options.space) {
    console.log("You can't list the space and read it at the same time");
    process.exit(0);
}
// console.log(options)
const client = (0, client_1.createReader)({
    port: options.port,
    space: options.space,
    host: options.host,
    protocol: options.protocol,
    path: options.path,
    keepAlive: true,
    timeout: 1000,
});
client.listenOnServerConnection('data', (data) => {
    process.stdout.write(data.toString());
});
// TODO: implement the list space
// TODO: implement the keep alive
// TODO: implement the timeout
//# sourceMappingURL=reader.cli.js.map