"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("../../server");
const commander_1 = require("commander");
function myParseInt(value) {
    // parseInt takes a string and a radix
    const parsedValue = parseInt(value, 10);
    if (isNaN(parsedValue)) {
        throw new commander_1.InvalidArgumentError('Not a number.');
    }
    return parsedValue;
}
commander_1.program
    .requiredOption('--port <integer>', 'port number of the server', myParseInt)
    .option('--path <string>', 'path of the server')
    .option('-si, --server-info [string...]', 'servers info << port:?path >>');
commander_1.program.parse();
const opts = commander_1.program.opts();
opts.serverInfo = opts.serverInfo.map((serverInfo) => {
    const [port, path] = serverInfo.split(':');
    return { port: parseInt(port), path: path?.trim() || '/' };
});
const options = opts;
console.log(options);
(0, server_1.createCluster)({ port: options.port, path: options.path || '/' }, options.serverInfo, { openOnStart: true });
// TODO: implement the list space
// TODO: implement the keep alive
// TODO: implement the timeout
//# sourceMappingURL=cluster.cli.js.map