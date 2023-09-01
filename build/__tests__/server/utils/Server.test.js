"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const Server_1 = __importDefault(require("../../../server/utils/Server"));
describe('Server', () => {
    const httpServer = Server_1.default.createHttpServer();
    beforeEach(() => {
        httpServer.listen(3000);
    });
    afterEach(() => {
        httpServer.close();
    });
    it('should create a server with default options', () => {
        const server = new Server_1.default(httpServer);
        (0, chai_1.expect)(server.port).to.equal(3000);
        (0, chai_1.expect)(server.connections.size).to.equal(0);
        (0, chai_1.expect)(server.opened).to.be.true;
    });
    it('should create a server with a port number', () => {
        const server = new Server_1.default(3001);
        (0, chai_1.expect)(server.port).to.equal(3001);
        (0, chai_1.expect)(server.connections.size).to.equal(0);
        (0, chai_1.expect)(server.opened).to.be.true;
        server.close();
        (0, chai_1.expect)(server.opened).to.be.false;
    });
    it('should create a server and open it later', () => {
        const server = new Server_1.default();
        (0, chai_1.expect)(server.port).to.equal(undefined);
        (0, chai_1.expect)(server.connections.size).to.equal(0);
        (0, chai_1.expect)(server.opened).to.be.false;
        server.open(httpServer);
        (0, chai_1.expect)(server.opened).to.be.true;
        (0, chai_1.expect)(server.port).to.equal(httpServer.port);
        server.close();
        (0, chai_1.expect)(server.opened).to.be.false;
        (0, chai_1.expect)(server.port).to.equal(undefined);
    });
    it('should create a server and connect a client to it', (done) => {
        const server = new Server_1.default(httpServer);
        const client = server.connect();
        client.on('connect', () => {
            (0, chai_1.expect)(server.connections.size).to.equal(1);
            done();
            server.close();
            client.disconnect();
        });
    });
    it('should remove a connection when a client disconnects', (done) => {
        const server = new Server_1.default(httpServer);
        const client = server.connect();
        client.on('connect', () => {
            (0, chai_1.expect)(server.connections.size).to.equal(1);
            client.disconnect();
        });
        client.on('disconnect', () => {
            setTimeout(() => {
                // wait for the disconnect event to be processed
                (0, chai_1.expect)(server.connections.size).to.equal(0);
                server.close();
                done();
            }, 100);
        });
    });
    it('should find a connection using a search function', (done) => {
        const server = new Server_1.default(httpServer);
        server.onConnection((connection) => {
            // this test is done because the onConnection event as to return the same connection object as the one passed to the Connections Set object
            const result = server.findConnection((c) => c === connection);
            (0, chai_1.expect)(result).to.equal(connection);
            client.disconnect();
            server.close();
            done();
        });
        const client = server.connect();
    });
});
//# sourceMappingURL=Server.test.js.map