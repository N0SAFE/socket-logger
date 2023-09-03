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
__exportStar(require("./utils"), exports);
//# sourceMappingURL=index.js.map