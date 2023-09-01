"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerCluster = exports.createServer = exports.createCluster = void 0;
const cluster_socket_io_1 = require("./cluster.socket.io");
Object.defineProperty(exports, "LoggerCluster", { enumerable: true, get: function () { return cluster_socket_io_1.LoggerCluster; } });
function createCluster(clusterInfo = { port: 65000, path: '/' }, serversInfo = [{ port: 65001, path: '/' }], { openOnStart = true }, guard = {}) {
    return new cluster_socket_io_1.LoggerCluster(clusterInfo, serversInfo, { openOnStart }, guard);
}
exports.createCluster = createCluster;
function createServer() {
    return undefined;
}
exports.createServer = createServer;
//# sourceMappingURL=index.js.map