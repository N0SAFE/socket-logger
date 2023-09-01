"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const Cluster_1 = __importDefault(require("../../../server/utils/Cluster"));
describe('Cluster', () => {
    const servers = [];
    const httpServer = Cluster_1.default.createHttpServer();
    beforeEach(() => {
        httpServer.listen(65200);
    });
    afterEach(() => {
        servers.forEach((server) => {
            server.close();
        });
        servers.length = 0;
        httpServer.close();
    });
    const closeClient = (client, done) => {
        if (client instanceof Array) {
            client.forEach((c) => {
                c.disconnect();
            });
        }
        else {
            client.disconnect();
        }
        setTimeout(() => {
            done();
        }, 100);
    };
    it('should create a cluster with default options', () => {
        const cluster = new Cluster_1.default({ port: 65100 });
        servers.push(cluster);
        (0, chai_1.expect)(cluster.port).to.equal(65100);
        (0, chai_1.expect)(cluster.p).to.equal('/');
        (0, chai_1.expect)(cluster.servers.size).to.equal(0);
        (0, chai_1.expect)(cluster.isOpened).to.be.true;
    });
    it('should create a cluster with custom options', () => {
        const cluster = new Cluster_1.default({ port: 65100, path: '/test' });
        servers.push(cluster);
        (0, chai_1.expect)(cluster.port).to.equal(65100);
        (0, chai_1.expect)(cluster.p).to.equal('/test');
        (0, chai_1.expect)(cluster.servers.size).to.equal(0);
        (0, chai_1.expect)(cluster.isOpened).to.be.true;
    });
    it('should create a cluster using an httpServer', () => {
        const cluster = new Cluster_1.default({ httpServer: httpServer, path: '/test' });
        servers.push(cluster);
        (0, chai_1.expect)(cluster.port).to.equal(65200);
        (0, chai_1.expect)(cluster.p).to.equal('/test');
        (0, chai_1.expect)(cluster.servers.size).to.equal(0);
        (0, chai_1.expect)(cluster.isOpened).to.be.true;
    });
    it('should add a server to the cluster', () => {
        const cluster = new Cluster_1.default({ httpServer: httpServer });
        const server = cluster.createServer({ port: 65201 });
        servers.push(cluster, server);
        (0, chai_1.expect)(server).to.not.be.undefined;
        (0, chai_1.expect)(cluster.servers.size).to.equal(1);
        (0, chai_1.expect)(cluster.serverExists({ port: 65201 })).to.be.true;
        (0, chai_1.expect)(cluster.serverExists({ port: 65201, path: '/socket.io' })).to.be
            .false;
        (0, chai_1.expect)(cluster.serverExists({ port: 65201 + 1 })).to.be.false;
    });
    it('should add a server to the cluster using an httpServer', () => {
        const cluster = new Cluster_1.default({ httpServer: httpServer });
        const server = cluster.createServer({ httpServer: httpServer });
        servers.push(cluster, server);
        (0, chai_1.expect)(server).to.not.be.undefined;
        (0, chai_1.expect)(cluster.servers.size).to.equal(1);
        (0, chai_1.expect)(cluster.serverExists({ httpServer: httpServer })).to.be.true;
        (0, chai_1.expect)(cluster.serverExists({ port: httpServer.port })).to.be.true;
        (0, chai_1.expect)(cluster.serverExists({
            port: httpServer.port,
            path: '/socket.io',
        })).to.be.false;
        (0, chai_1.expect)(cluster.serverExists({ port: httpServer.port + 1 })).to
            .be.false;
    });
    it('should redirect a client to a server', (done) => {
        const cluster = new Cluster_1.default({ httpServer: httpServer });
        const server = cluster.createServer({
            httpServer: httpServer,
            path: '/server1',
        });
        servers.push(cluster, server);
        const client = cluster.connect();
        cluster.onConnection((connection) => {
            (0, chai_1.expect)(connection.server).to.equal(cluster);
            (0, chai_1.expect)(cluster.connections.size).to.equal(1);
        });
        const promise1 = new Promise((resolve) => {
            client.onRedirect(() => {
                resolve('ok');
            });
        });
        const promise2 = new Promise((resolve, reject) => {
            server.onConnection(() => {
                try {
                    (0, chai_1.expect)(server.connections.size).to.equal(1);
                    (0, chai_1.expect)(client.info?.port).to.equal(httpServer.port);
                    (0, chai_1.expect)(client.info?.path).to.equal('/server1');
                    resolve('ok');
                }
                catch (e) {
                    reject(e);
                }
            });
        });
        Promise.all([promise1, promise2])
            .then(() => {
            closeClient(client, done);
        })
            .catch((error) => {
            closeClient(client, () => {
                done(error);
            });
        });
    });
    it('should redirect multiple clients to the appropriate servers', (done) => {
        ;
        (async () => {
            const cluster = new Cluster_1.default({ httpServer: httpServer });
            const server1 = cluster.createServer({
                httpServer: httpServer,
                path: '/server1',
            });
            const server2 = cluster.createServer({
                httpServer: httpServer,
                path: '/server2',
            });
            servers.push(cluster, server1, server2);
            const client1 = cluster.connect();
            cluster.onConnection((connection) => {
                (0, chai_1.expect)(connection.server).to.equal(cluster);
                (0, chai_1.expect)(cluster.connections.size).to.equal(1);
            });
            const promise1 = new Promise((resolve) => {
                client1.onRedirect((info) => {
                    (0, chai_1.expect)(info.type).to.equal('redirected');
                    (0, chai_1.expect)(info.path).to.equal('/server1');
                    resolve('ok');
                });
            });
            const promise2 = new Promise((resolve, reject) => {
                server1.onConnection(() => {
                    try {
                        (0, chai_1.expect)(server1.connections.size).to.equal(1);
                        (0, chai_1.expect)(client1.info?.port).to.equal(httpServer.port);
                        (0, chai_1.expect)(client1.info?.path).to.equal('/server1');
                        resolve('ok');
                    }
                    catch (e) {
                        reject(e);
                    }
                });
            });
            await Promise.all([promise1, promise2]);
            const client2 = cluster.connect();
            const promise3 = new Promise((resolve) => {
                client2.onRedirect((info) => {
                    (0, chai_1.expect)(info.type).to.equal('redirected');
                    (0, chai_1.expect)(info.path).to.equal('/server2');
                    resolve('ok');
                });
            });
            const promise4 = new Promise((resolve, reject) => {
                server2.onConnection(() => {
                    try {
                        (0, chai_1.expect)(server2.connections.size).to.equal(1);
                        (0, chai_1.expect)(client2.info?.port).to.equal(httpServer.port);
                        (0, chai_1.expect)(client2.info?.path).to.equal('/server2');
                        resolve('ok');
                    }
                    catch (e) {
                        reject(e);
                    }
                });
            });
            await Promise.all([promise1, promise2, promise3, promise4])
                .then(() => {
                closeClient([client1, client2], done);
            })
                .catch((error) => {
                closeClient([client1, client2], () => {
                    done(error);
                });
            })
                .finally(() => {
                httpServer.close();
            });
        })();
    });
    // it('should not add a server to the cluster if the path is not allowed', () => {
    //   const cluster = new Cluster(httpServer, [{ port: 3001, path: '/test' }])
    //   const server = cluster.createServer({ port: 3001, path: '/invalid' })
    //   expect(server).to.be.undefined
    //   expect(cluster.servers.size).to.equal(0)
    //   expect(cluster.serverExists(3001)).to.be.false
    // })
    // it('should find a server in the cluster', () => {
    //   const cluster = new Cluster(httpServer)
    //   const server = cluster.createServer({ port: 3000 })
    //   const result = cluster.findServer((s) => s === server)
    //   expect(result).to.equal(server)
    // })
    // it('should not find a server in the cluster', () => {
    //   const cluster = new Cluster(httpServer)
    //   const result = cluster.findServer((s) => s.port === 3000)
    //   expect(result).to.be.undefined
    // })
    // it('should find a server by port', () => {
    //   const cluster = new Cluster(httpServer)
    //   const server = cluster.createServer({ port: 3000 })
    //   const result = cluster.findServerByPort(3000)
    //   expect(result).to.equal(server)
    // })
    // it('should throw an error when finding a server by port that does not exist', () => {
    //   const cluster = new Cluster(httpServer)
    //   expect(() => cluster.findServerByPort(3000)).to.throw('server not found')
    // })
    // it('should check if a port is in range', () => {
    //   const cluster = new Cluster(httpServer)
    //   const result = cluster.portIsInRange(65000)
    //   expect(result).to.be.true
    // })
    // it('should check if a port is not in range', () => {
    //   const cluster = new Cluster(httpServer)
    //   const result = cluster.portIsInRange(70000)
    //   expect(result).to.be.false
    // })
    // it('should get an HTTP server', () => {
    //   const cluster = new Cluster(httpServer)
    //   const result = cluster.getHttpServer(3000)
    //   expect(result).to.be.an.instanceOf(HttpServer)
    //   expect(cluster.httpServerMap.has(3000)).to.be.true
    // })
    // it('should check if a path is allowed', () => {
    //   const cluster = new Cluster(httpServer, [{ port: 3001, path: '/test' }])
    //   const result = cluster.pathIsAllowed(3001, '/test')
    //   expect(result).to.be.true
    // })
    // it('should redirect to a server', () => {
    //   const cluster = new Cluster(httpServer)
    //   const server = cluster.createServer({ port: 3000 })
    //   const payload = { message: 'test' }
    //   // const callback = (info) => {
    //   //   expect(info.type).to.equal('redirected')
    //   //   expect(info.data).to.equal('redirected to port 3000')
    //   //   expect(info.port).to.equal(3000)
    //   //   expect(info.path).to.equal('')
    //   //   expect(info.payload).to.deep.equal(payload)
    //   // }
    //   cluster.redirect(server, { port: 3000 }, payload)
    // })
    // it('should create multiple servers', () => {
    //   const cluster = new Cluster(httpServer)
    //   cluster.createServers(
    //     (port, path, index) => ({ index }),
    //     ({ server, store }) => {
    //       expect(server.port).to.equal(65001 + store.index)
    //       expect(cluster.servers.size).to.equal(store.index + 1)
    //     },
    //   )
    //   expect(cluster.servers.size).to.equal(1)
    // })
    // it('should close the cluster', () => {
    //   const cluster = new Cluster(httpServer)
    //   const server = cluster.createServer({ port: 3000 })
    //   cluster.open(3000)
    //   cluster.close()
    //   expect(server.opened).to.be.false
    //   expect(cluster.isOpened).to.be.false
    // })
    // it('should handle a connection', async () => {
    //   const cluster = new Cluster(httpServer)
    //   const server = cluster.createServer({ port: 3000 })
    //   const socket = new SocketServer.Socket(socketServer)
    //   const callback = (connection) => {
    //     expect(connection.server).to.equal(server)
    //     expect(connection.socket).to.equal(socket)
    //   }
    //   await cluster.open(3000)
    //   cluster.onConnection(callback)
    //   socket.emit('connection')
    // })
});
//# sourceMappingURL=Cluster.test.js.map