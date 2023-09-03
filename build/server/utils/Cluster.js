"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Server_1 = __importDefault(require("./Server"));
const utils_1 = require("../../utils");
const http_1 = require("http");
function dummyFunction(...args) {
    args;
}
class Cluster extends Server_1.default {
    clusterInfo;
    serversInfo;
    store;
    servers;
    httpServerMap = new utils_1.AdvancedMap();
    isOpened = false;
    redirectFn = (connection) => {
        // search the server with the lowest number of connections
        const server = this.servers.min((s) => s.connections.size);
        if (!server) {
            throw new Error('no server found');
        }
        this.redirect(connection.server, server.key);
    };
    onConnectionFn = () => {
        this.emit('connection', {
            isCluster: true,
        });
    };
    constructor(clusterInfo = { port: 65000, path: '/' }, serversInfo = [{ port: 65001, path: '/' }], opts = { openOnStart: true }, store = {}) {
        super({ path: clusterInfo.path });
        this.clusterInfo = clusterInfo;
        this.serversInfo = serversInfo;
        this.store = store;
        if (opts.openOnStart) {
            this.open(this.clusterInfo);
        }
        this.servers = new utils_1.AdvancedMap();
        this.emit('beforeCreateServers');
        dummyFunction(this.store); // this function is called to avoid error on the ts parser for the unused variable store
        super.onConnection((connection) => {
            this.redirectFn(connection);
        });
    }
    setRedirectFn(callback) {
        this.redirectFn = callback;
    }
    open(serverInfo) {
        this.emit('beforeOpen');
        if (serverInfo instanceof http_1.Server) {
            super.open(this.getHttpServer({ httpServer: serverInfo, path: this.p || '/' }));
        }
        else if (typeof serverInfo === 'number') {
            super.open(this.getHttpServer({ port: serverInfo, path: this.p || '/' }));
        }
        else {
            super.open(this.getHttpServer(serverInfo));
        }
        this.emit('open');
        this.isOpened = true;
        return this;
    }
    close() {
        this.emit('beforeClose');
        super.close();
        this.servers.forEach((_, server) => {
            server.close();
        });
        this.emit('close');
        this.isOpened = false;
        return this;
    }
    serverExists(serverInfo) {
        if (serverInfo.path) {
            return this.servers.some((s) => (s.port === serverInfo.port ||
                serverInfo.httpServer?.port === s.port) &&
                s.p === serverInfo.path);
        }
        return this.servers.some((server) => server.port === serverInfo.port ||
            server.port === serverInfo.httpServer?.port);
    }
    findServer(verify) {
        return this.servers.find(verify);
    }
    findServerByPort(serverInfo) {
        const server = this.findServer((server, _) => {
            _;
            return (server.port === serverInfo.port ||
                server.port === serverInfo.httpServer?.port);
        });
        if (server) {
            return server;
        }
        throw new Error('server not found');
    }
    portIsInRange(serverInfo) {
        if (serverInfo.httpServer instanceof http_1.Server) {
            return this.serversInfo.some((s) => {
                s.httpServer === serverInfo.httpServer;
            });
        }
        return this.serversInfo.some((s) => {
            s.port === serverInfo.port || s.httpServer?.port === serverInfo.port;
        });
    }
    getHttpServer(serverInfo) {
        if (serverInfo.httpServer instanceof http_1.Server) {
            if (!this.httpServerMap.some((port, httpServer) => httpServer === serverInfo.httpServer)) {
                this.httpServerMap.set(serverInfo.httpServer.port, serverInfo.httpServer);
            }
            return serverInfo.httpServer;
        }
        if (this.httpServerMap.has(serverInfo.port)) {
            return this.httpServerMap.get(serverInfo.port);
        }
        const httpServer = Cluster.createHttpServer(serverInfo.port);
        this.httpServerMap.set(serverInfo.port, httpServer);
        return httpServer;
    }
    pathIsAllowed(serverInfo) {
        const s = this.serversInfo.find((s) => s.port === serverInfo.port || s.httpServer?.port === serverInfo.port);
        if (!s) {
            throw new Error('server not found');
        }
        if (!s.path) {
            return true;
        }
        return s.path === serverInfo.path;
    }
    redirect(server, serverToRedirect, payload) {
        server.emit('redirect', {
            type: 'redirected',
            data: 'redirected to port ' +
                serverToRedirect.port +
                (serverToRedirect.p && ' and path ' + serverToRedirect.p),
            path: serverToRedirect.p || '',
            payload: payload,
            ...(serverToRedirect.port === server.port
                ? {}
                : { port: serverToRedirect.port }),
        });
    }
    addServer(serverInfo) {
        this.serversInfo.push(serverInfo);
    }
    createServer(serverInfo, store = {}, callback) {
        // ! to test
        // ! if the port or the path does not exist add the server to the list and create it
        // ! else verify if the server already exist and return it or create it
        if (!this.portIsInRange(serverInfo) && serverInfo.path
            ? !this.pathIsAllowed(serverInfo)
            : true) {
            this.addServer(serverInfo);
        }
        else if (this.serverExists(serverInfo)) {
            return this.findServerByPort(serverInfo).key;
        }
        const server = new Server_1.default(this.getHttpServer(serverInfo), serverInfo);
        this.servers.set(server, store);
        callback?.({ server, store });
        return server;
    }
    createServers(store, callback, onServerError = () => {
        return undefined;
    }) {
        this.serversInfo.forEach(({ port, path, httpServer }, index) => {
            if (httpServer) {
                const Tstore = store(httpServer.port, path, index);
                this.createServer({ path, httpServer }, Tstore, callback);
            }
            else {
                const Tstore = store(port, path, index);
                this.createServer({ port: port, path }, Tstore, callback);
            }
        });
        onServerError;
    }
}
exports.default = Cluster;
//# sourceMappingURL=Cluster.js.map