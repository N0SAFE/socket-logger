"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_client_1 = __importDefault(require("socket.io-client"));
const events_1 = require("events");
const cli_color_1 = __importDefault(require("cli-color"));
class Client {
    info;
    socket;
    events = new events_1.EventEmitter();
    constructor(info) {
        this.info = info;
        if (info) {
            this.connect(info);
        }
    }
    connectErrorFn = (err) => {
        this.events.emit('connect_error', err);
    };
    connectFn = async () => {
        const [data] = await this.awaitFor('connection');
        if (data.status === 'KO') {
            throw new Error(data.message || 'unknown error');
        }
        if (data.isCluster) {
            this.events.emit('clusterConnect');
        }
        else {
            this.events.emit('serverConnect');
        }
        // console.log('connected')
        this.events.emit('connect');
    };
    disconnectFn = () => {
        this.removeAllListeners();
        this.events.emit('disconnect');
    };
    errorFn = (err) => {
        console.error(cli_color_1.default.red('ERR', JSON.stringify(err)));
    };
    emitOnClusterConnection(evt, callback, ...args) {
        this.onClusterConnect(async () => {
            if (typeof callback === 'function') {
                this.emit(evt, ...(await callback()));
            }
            else {
                this.emit(evt, callback, ...args);
            }
        });
        return this;
    }
    emitOnServerConnection(evt, callback, ...args) {
        this.onServerConnect(async () => {
            if (typeof callback === 'function') {
                this.emit(evt, ...(await callback()));
            }
            else {
                this.emit(evt, callback, ...args);
            }
        });
        return this;
    }
    listenOnClusterConnection(evt, callback) {
        this.onClusterConnect(() => {
            this.on(evt, callback);
        });
        return this;
    }
    listenOnServerConnection(evt, callback) {
        this.onServerConnect(() => {
            this.on(evt, callback);
        });
        return this;
    }
    connect(newInfo) {
        // console.log(newInfo)
        if (this.info) {
            this.info = {
                ...this.info,
                ...newInfo,
            };
        }
        else {
            this.info = newInfo;
        }
        if (this.socket) {
            this.removeAllListeners();
            this.clearPrivateEvents();
            this.socket.close();
            delete this.socket;
        }
        const path = typeof this.info.path === 'string'
            ? this.info.path?.[0] === '/'
                ? this.info.path
                : '/' + this.info.path
            : '/';
        this.socket = (0, socket_io_client_1.default)(`${this.info.protocol}://${this.info.host}${this.info.port ? `:${this.info.port}` : ''}`, {
            path: path,
            autoConnect: true,
            reconnection: true,
        });
        // console.log(
        //   `connecting to ${this.info.protocol}://${this.info.host}${
        //     this.info.port ? `:${this.info.port}` : ''
        //   }${path}`,
        // )
        this.onRedirect((info) => {
            this.connect(info);
        });
        this.socket.on('connect_error', this.connectErrorFn);
        this.socket.on('disconnect', this.disconnectFn);
        this.socket.on('connect', this.connectFn);
        this.socket.on('error', this.errorFn);
        return this;
    }
    clearPrivateEvents() {
        const list = [
            ['connect_error', this.connectErrorFn],
            ['connect', this.connectFn],
            ['disconnect', this.disconnectFn],
        ];
        list.forEach(([event, callback]) => {
            if (this.socket) {
                this.socket.off(event, callback);
            }
        });
    }
    removeAllListeners(list = [], listType = 'black') {
        const socket = this.socket;
        const callbacksList = Object.entries(socket._callbacks);
        callbacksList.forEach(([event, callbacks]) => {
            if (event.startsWith('$')) {
                event = event.slice(1);
            }
            ;
            [...callbacks].forEach((callback) => {
                if (list.includes(event) || list.includes(callback)) {
                    if (listType === 'white' &&
                        ![this.connectErrorFn, this.connectFn, this.disconnectFn].includes(callback)) {
                        socket.off(event, callback);
                    }
                    return;
                }
                if (listType === 'black' &&
                    ![this.connectErrorFn, this.connectFn, this.disconnectFn].includes(callback)) {
                    socket.off(event, callback);
                }
            });
        });
        return this;
    }
    onRedirect(callback) {
        if (this.socket) {
            this.socket.on('redirect', callback);
        }
        return this;
    }
    onServerConnect(callback) {
        this.events.on('serverConnect', callback);
        return this;
    }
    onClusterConnect(callback) {
        this.events.on('clusterConnect', callback);
        return this;
    }
    onConnect(callback) {
        this.events.on('connect', callback);
        return this;
    }
    onConnectOnce(callback) {
        const fn = async () => {
            if (await callback()) {
                this.events.off('connect', fn);
            }
        };
        this.events.on('connect', fn);
        return this;
    }
    onDisconnect(callback) {
        this.events.on('disconnect', callback);
        return this;
    }
    onError(callback) {
        if (this.socket) {
            this.socket.on('connect_error', callback);
        }
        return this;
    }
    on(event, callback) {
        if (this.socket) {
            this.socket.on(event, callback);
        }
        return this;
    }
    emit(event, ...args) {
        if (this.socket) {
            this.socket.emit(event, ...args);
        }
        return this;
    }
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
        }
        return this;
    }
    get connected() {
        return this.socket?.connected;
    }
    get disconnected() {
        return this.socket?.disconnected;
    }
    get id() {
        return this.socket?.id;
    }
    awaitFor(ev, callback) {
        return new Promise((resolve) => {
            if (this.socket) {
                this.socket.on(ev, (...args) => {
                    if (callback) {
                        if (callback(...args)) {
                            resolve(args);
                        }
                    }
                    else {
                        resolve(args);
                    }
                });
                return;
            }
            resolve([null]);
        });
    }
    request(ev, ...args) {
        this.emit(ev, ...args);
        return this.awaitFor(ev);
    }
}
exports.default = Client;
//# sourceMappingURL=Client.js.map