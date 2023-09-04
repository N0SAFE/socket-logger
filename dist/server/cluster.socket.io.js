"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerCluster = exports.log = void 0;
const utils_1 = require("../utils");
const utils_2 = require("./utils");
const cli_color_1 = __importDefault(require("cli-color"));
const _1 = require(".");
const log = (message, ...args) => {
    console.log(`[ ${cli_color_1.default.yellow('SOCKET')} ] ` + message, args);
};
exports.log = log;
// const reservedSpaces = ['server']
// reservedSpaces
class LoggerCluster extends utils_2.Cluster {
    guard;
    adminReader = new _1.LoggerConnectionSet();
    constructor(clusterInfo = { port: 65000, path: '/' }, serversInfo = [{ port: 65001, path: '/' }], { openOnStart = true }, guard = {}) {
        super(clusterInfo, serversInfo, { openOnStart: false }, {});
        this.guard = guard;
        guard.verifyServerConnection =
            guard.verifyServerConnection || (async () => ({ success: true }));
        guard.verifyServerSubscription =
            guard.verifyServerSubscription || (async () => ({ success: true }));
        guard.verifyClusterConnection =
            guard.verifyClusterConnection || (async () => ({ success: true }));
        this.createServers(() => new _1.SpaceMap(), ({ server }) => {
            (0, exports.log)(cli_color_1.default.green('creating server on port ' + server.port + server.p));
            server.onConnection(async (connection) => {
                const response = (await this.guard.verifyServerConnection?.(connection));
                if (!response.success) {
                    // response.message && log(clc.red(response.message))
                    connection.socket.emit('error', {
                        message: response.message,
                        code: 'CONNECTION:NOT:ALLOWED',
                    });
                    connection.socket.disconnect();
                    return;
                }
                else if (response.success && response.message) {
                    // log(clc.yellow(response.message))
                }
                const timeout = setTimeout(() => {
                    loggerConnection.socket.disconnect();
                    // log(
                    //   clc.red(
                    //     'connection timeout on host ' +
                    //       loggerConnection.socket.handshake.headers.host +
                    //       ' disconnecting...',
                    //   ),
                    // )
                }, 10000);
                // log(clc.yellow('new connection waiting for subscribe'))
                const loggerConnection = new _1.LoggerConnection(connection.server, connection.socket);
                connection.socket.on('subscribe', async (data) => {
                    clearTimeout(timeout);
                    const response = (await this.guard.verifyServerSubscription?.(connection, data));
                    if (!response.success) {
                        // response.message && log(clc.red(response.message))
                        connection.socket.emit('error', {
                            message: response.message,
                            code: 'SUBSCRIPTION:NOT:ALLOWED',
                        });
                        connection.socket.disconnect();
                        return;
                    }
                    else if (response.success && response.message) {
                        // log(clc.yellow(response.message))
                    }
                    connection.socket.emit('info', {
                        message: response.message,
                        code: 'SUBSCRIPTION:ALLOWED',
                    });
                    const { space, type } = data;
                    loggerConnection.space = space;
                    loggerConnection.type = type;
                    if (type === 'writer') {
                        // log(clc.green('new writer connected on space ' + space))
                        const loggerConnectionSet = this.addSpaceToServer(server, space);
                        const writerConnectionSet = this.getWritersBySpace(space);
                        if (writerConnectionSet.size === 1) {
                            // log(clc.red('writer already connected on space ' + space))
                            loggerConnection.socket.emit('error', {
                                message: 'writer already connected',
                                code: 'WRITER:ALREADY:CONNECTED',
                            });
                        }
                        loggerConnectionSet.add(loggerConnection);
                        this.sendToReadersBySpace(space, {
                            message: 'the writer is connected',
                            code: 'WRITER:CONNECTED',
                        }, 'info');
                        loggerConnection.socket.on('data', (data) => {
                            this.sendToReadersBySpace(space, data, 'data');
                        });
                        loggerConnection.socket.on('error', (data) => {
                            this.sendToReadersBySpace(space, data, 'error');
                        });
                        loggerConnection.socket.on('info', (data) => {
                            this.sendToReadersBySpace(space, data, 'info');
                        });
                        loggerConnection.socket.on('disconnect', () => {
                            this.removeByConnection(loggerConnection);
                        });
                    }
                    else if (type === 'reader') {
                        // log(clc.green('new reader connected on space ' + space))
                        const loggerConnectionSet = this.addSpaceToServer(server, space);
                        loggerConnectionSet.add(loggerConnection);
                        const writerConnectionSet = this.getWritersBySpace(space);
                        if (writerConnectionSet.size === 1) {
                            loggerConnection.socket.emit('info', {
                                message: 'writer already connected',
                                code: 'WRITER:ALREADY:CONNECTED',
                            });
                        }
                        loggerConnection.socket.on('disconnect', () => {
                            this.removeByConnection(loggerConnection);
                        });
                    }
                    else if (type === 'admin') {
                        // log(clc.green('new admin connected on space ' + space))
                        this.adminReader.add(loggerConnection);
                    }
                });
            });
        });
        this.setRedirectFn(async (connection) => {
            const response = (await this.guard.verifyClusterConnection?.(connection));
            if (!response.success) {
                response.message && (0, exports.log)(cli_color_1.default.red(response.message));
                connection.socket.emit('error', {
                    message: response.message,
                    code: 'CONNECTION:NOT:ALLOWED',
                });
                connection.socket.disconnect();
                return;
            }
            else if (response.success && response.message) {
                // log(clc.yellow(response.message))
            }
            // log(
            //   clc.yellow(
            //     'new connection on the cluster waiting for the client to request his server',
            //   ),
            // )
            const loggerConnection = new _1.LoggerConnection(connection);
            const timeout = setTimeout(() => {
                loggerConnection.socket.disconnect();
                (0, exports.log)(cli_color_1.default.red('connection timeout on host ' +
                    loggerConnection.socket.handshake.headers.host +
                    ' disconnecting...'));
            }, 10000);
            const promise = new Promise((resolve) => {
                loggerConnection.socket.on('request', (data) => {
                    clearTimeout(timeout);
                    const { space } = data;
                    loggerConnection.space = space;
                    const server = this.searchServerToUse(space);
                    // log(clc.green('new connection redirected to ' + server.port))
                    this.redirect(loggerConnection.server, server);
                    // log(
                    //   clc.yellow(
                    //     'waiting for connection on ' + server.port + server.p,
                    //   ),
                    // )
                    resolve({ port: server.port, space });
                });
            });
            return promise;
        });
        if (openOnStart) {
            this.open(clusterInfo);
        }
    }
    open(srv) {
        super.open(srv);
        (0, exports.log)('opening cluster on port ' + srv);
        (0, exports.log)('waiting for connections...');
        return this;
    }
    getSpaceMapByServer(server) {
        const space = this.servers.get(server);
        if (!space) {
            throw new Error('space map not found');
        }
        return space;
    }
    getLoggerConnectionSetBySpace(space) {
        const server = this.servers.find((_, value) => value.has((key, _) => {
            _;
            return key === space;
        }))?.key;
        if (!server) {
            throw new Error('server not found');
        }
        const spaceMap = this.getSpaceMapByServer(server);
        const loggerConnectionSet = spaceMap.get(space);
        if (!loggerConnectionSet) {
            return new _1.LoggerConnectionSet();
        }
        return loggerConnectionSet;
    }
    getSpaceByLoggerConnection(connection) {
        const server = this.getServerByLoggerConnection(connection);
        if (!server) {
            return;
        }
        const spaceMap = this.getSpaceMapByServer(server);
        if (!spaceMap) {
            return;
        }
        const space = spaceMap.find((_, value) => value.has(connection))?.key;
        return space;
    }
    getServerByLoggerConnection(connection) {
        const server = this.servers.find((_, value) => value.has((_, value) => value.has(connection)))?.key;
        if (!server) {
            return;
        }
        return server;
    }
    getServerBySpace(space) {
        const server = this.servers.find((_, value) => value.has(space))?.key;
        return server;
    }
    IsSpaceExists(space) {
        return this.servers.has((_, value) => value.has(space));
    }
    deleteSpaceIfEmpty(space) {
        const server = this.getServerBySpace(space);
        if (!server) {
            return;
        }
        const loggerConnectionSet = this.getLoggerConnectionSetBySpace(space);
        if (!loggerConnectionSet) {
            return;
        }
        if (loggerConnectionSet.size === 0) {
            this.removeSpace(space);
        }
    }
    removeByConnection(connection) {
        const space = this.getSpaceByLoggerConnection(connection);
        if (!space) {
            return;
        }
        const connectionsSet = this.getLoggerConnectionSetBySpace(space);
        if (!connectionsSet) {
            return;
        }
        (0, exports.log)(cli_color_1.default.red(`removing ${connection.type} ` + connection));
        connectionsSet.delete(connection);
        this.deleteSpaceIfEmpty(space);
    }
    removeWriterBySpace(space) {
        const connectionsSet = this.getLoggerConnectionSetBySpace(space);
        if (!connectionsSet) {
            return;
        }
        this.getWritersBySpace(space).forEach((connection) => {
            (0, exports.log)(cli_color_1.default.red('removing writer ' + connection));
            connectionsSet.delete(connection);
        });
        this.deleteSpaceIfEmpty(space);
    }
    removeReadersBySpace(space) {
        const connectionsSet = this.getLoggerConnectionSetBySpace(space);
        if (!connectionsSet) {
            return;
        }
        this.getReadersBySpace(space).forEach((connection) => {
            (0, exports.log)(cli_color_1.default.red('removing reader ' + connection));
            connectionsSet.delete(connection);
        });
        this.deleteSpaceIfEmpty(space);
    }
    removeSpace(space) {
        (0, exports.log)(cli_color_1.default.red('removing space ' + space));
        const server = this.getServerBySpace(space);
        if (!server) {
            return;
        }
        const spaceMap = this.getSpaceMapByServer(server);
        if (!spaceMap) {
            return;
        }
        spaceMap.delete(space);
    }
    removeSpaceByConnection(connection) {
        const space = this.getSpaceByLoggerConnection(connection);
        if (!space) {
            return;
        }
        const connectionsSet = this.getLoggerConnectionSetBySpace(space);
        if (!connectionsSet) {
            return;
        }
        (0, exports.log)(cli_color_1.default.red('removing connection ' + connection));
        connectionsSet.delete(connection);
        if (connectionsSet.size === 0) {
            this.removeSpace(space);
        }
    }
    getWritersBySpace(space) {
        const connectionsSet = this.getLoggerConnectionSetBySpace(space);
        const writer = connectionsSet.filter((connection) => connection.type === 'writer');
        return writer;
    }
    getReadersBySpace(space) {
        const connectionsSet = this.getLoggerConnectionSetBySpace(space);
        const readers = connectionsSet.filter((connection) => connection.type === 'reader');
        return readers;
    }
    getAdmins() {
        return this.adminReader;
    }
    getAdminsBySpace(space) {
        const admins = this.getAdmins().filter((connection) => connection.space === space);
        return admins;
    }
    getAdminsByServer(server) {
        const admins = this.getAdmins().filter((connection) => connection.server === server);
        return admins;
    }
    getAdminsBySpaceAndServer(space, server) {
        const admins = this.getAdmins().filter((connection) => connection.space === space && connection.server === server);
        return admins;
    }
    getAdminsBySpaceOrServer(space, server) {
        const admins = this.getAdmins().filter((connection) => connection.space === space || connection.server === server);
        return admins;
    }
    sendToReadersBySpace(space, data, evt = 'data') {
        const readers = this.getReadersBySpace(space);
        const admins = this.getAdminsBySpace(space);
        admins.forEach((connection) => {
            connection.socket.emit('server', {
                type: 'send',
                from: 'writer',
                evt,
                data,
            });
        });
        readers.forEach((connection) => {
            connection.socket.emit(evt, data);
        });
    }
    sendToWriterBySpace(space, data, evt = 'data') {
        const writer = this.getWritersBySpace(space);
        const admins = this.getAdminsBySpace(space);
        admins.forEach((connection) => {
            connection.socket.emit('server', {
                type: 'send',
                from: 'reader',
                evt,
                data,
            });
        });
        writer.forEach((connection) => {
            connection.socket.emit(evt, data);
        });
    }
    readFromWriterBySpace(space, callback, evt = 'data') {
        const writer = this.getWritersBySpace(space);
        const admins = this.getAdminsBySpace(space);
        writer.forEach((connection) => {
            connection.socket.on(evt, (data) => {
                admins.forEach((connection) => {
                    connection.socket.emit('server', {
                        type: 'read',
                        from: 'writer',
                        evt,
                        data,
                    });
                });
                callback(data);
            });
        });
    }
    readFromReadersBySpace(space, callback, evt = 'data') {
        const readers = this.getReadersBySpace(space);
        const admins = this.getAdminsBySpace(space);
        readers.forEach((connection) => {
            connection.socket.on(evt, (data) => {
                admins.forEach((connection) => {
                    connection.socket.emit('server', {
                        type: 'read',
                        from: 'reader',
                        evt,
                        data,
                    });
                });
                callback(data);
            });
        });
    }
    // listSpaces() {
    //     return this.spaces.reduce((acc, set, server) => {
    //         acc[server.port] = Array.from(set).map((connection) => connection.id);
    //         return acc;
    //     }, {});
    // }
    searchServerToUse(space) {
        const admins = this.getAdmins();
        const server = this.getServerBySpace(space);
        admins.forEach((connection) => {
            connection.socket.emit('cluster', {
                type: 'log',
                message: 'searching server to use for space ' + space,
            });
        });
        (0, exports.log)('searching server to use for space ' + space);
        if (server) {
            return server;
        }
        else {
            const servers = Array.from(this.servers).sort((a, b) => a[1].size - b[1].size);
            const server = servers[0][0];
            admins.forEach((connection) => {
                connection.socket.emit('cluster', {
                    type: 'log',
                    message: 'using server ' + server.port,
                });
            });
            (0, exports.log)('using server ' + server.port);
            return server;
        }
    }
    addSpaceToServer(server, space) {
        const admins = this.getAdmins();
        if (!this.servers.get(server)) {
            admins.forEach((connection) => {
                connection.socket.emit('cluster', {
                    type: 'error',
                    message: 'server not found',
                });
            });
            throw new Error('server not found');
        }
        if (!this.IsSpaceExists(space)) {
            admins.forEach((connection) => {
                connection.socket.emit('cluster', {
                    type: 'log',
                    message: 'adding space ' + space + ' to server ' + server.port,
                });
            });
            (0, exports.log)(cli_color_1.default.green('adding space ' + space + ' to server ' + server.port));
            this.servers.get(server)?.set(space, new utils_1.AdvancedSet());
        }
        const connection = this.servers.get(server)?.get(space);
        if (!connection) {
            throw new Error('connection not found');
        }
        return connection;
    }
}
exports.LoggerCluster = LoggerCluster;
//# sourceMappingURL=cluster.socket.io.js.map