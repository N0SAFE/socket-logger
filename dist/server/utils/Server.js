"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const Connection_1 = __importDefault(require("./Connection"));
const http_1 = require("http");
const Client_1 = __importDefault(require("../../client/utils/Client"));
class Server extends socket_io_1.Server {
    port;
    connections = new Set();
    opened = false;
    p = '/';
    onConnectionFn = () => {
        this.emit('connection', {
            isCluster: false,
        });
    };
    constructor(...args) {
        let _args = args;
        let srv;
        if (typeof args[0] === 'number' || args[0] instanceof http_1.Server) {
            srv = args[0];
            _args = args.slice(1);
        }
        if (_args.length === 0) {
            _args = [{}];
        }
        _args[0].path =
            _args[0].path?.[0] === '/'
                ? _args[0].path
                : '/' + (typeof _args[0].path === 'string' ? _args[0].path : '');
        if (_args[0].serverOptions) {
            _args[0] = { ..._args[0], ..._args[0].serverOptions };
        }
        _args[0].cors = _args[0].cors || {
            origin: '*',
            methods: ['GET', 'POST'],
        };
        _args[0].allowRequest = _args[0].allowRequest || ((_req, _fn) => {
            _fn(null, true);
        });
        super(..._args);
        this.p = _args[0].path;
        if (srv) {
            this.open(srv);
        }
        this.on('connection', (socket) => {
            const connection = new Connection_1.default(this, socket);
            this.connections.add(connection);
            this.onConnectionFn(connection);
            socket.on('disconnect', () => {
                this.connections.delete(connection);
            });
        });
    }
    onConnection(callback) {
        this.on('connection', (socket) => {
            const connection = this.findConnection((c) => c.socket === socket);
            callback(connection);
        });
    }
    open(srv) {
        this.opened = true;
        if (typeof srv === 'number') {
            this.port = srv;
        }
        else if (srv instanceof http_1.Server) {
            const httpServer = srv;
            this.port = httpServer.port;
        }
        this.listen(srv);
    }
    awaitFor(eventName, _callback = () => true) {
        const callback = function (...args) {
            return _callback(...args);
        };
        return new Promise((resolve) => {
            this.on(eventName, (data) => {
                if (callback(data)) {
                    resolve(data);
                    this.off(eventName, callback);
                }
            });
        });
    }
    request(ev, ...args) {
        this.emit(ev, ...args);
        return this.awaitFor(ev);
    }
    findConnection(search) {
        return Array.from(this.connections).find(search);
    }
    close() {
        this.opened = false;
        this.port = undefined;
        super.close();
    }
    connect() {
        return new Client_1.default({
            port: this.port,
            host: 'localhost',
            path: this.p,
            protocol: 'http',
        });
    }
    static createHttpServer(port) {
        const httpServer = (0, http_1.createServer)();
        const listen = httpServer.listen;
        httpServer.listen = (...args) => {
            if (typeof args[0] === 'number') {
                httpServer.port = args[0];
            }
            else if (typeof args[0] === 'object') {
                httpServer.port = args[0].port;
            }
            listen.call(httpServer, ...args);
            return httpServer;
        };
        if (port) {
            httpServer.listen(port);
            httpServer.port = port;
        }
        httpServer.setMaxListeners(0);
        return httpServer;
    }
}
exports.default = Server;
//# sourceMappingURL=Server.js.map