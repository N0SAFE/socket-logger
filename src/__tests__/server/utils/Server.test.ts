import { expect } from 'chai'
import Server from '../../../server/utils/Server'

describe('Server', () => {
  const httpServer = Server.createHttpServer()

  beforeEach(() => {
    httpServer.listen(3000)
  })

  afterEach(() => {
    httpServer.close()
  })

  it('should create a server with default options', () => {
    const server = new Server(httpServer)
    expect(server.port).to.equal(3000)
    expect(server.connections.size).to.equal(0)
    expect(server.opened).to.be.true
  })

  it('should create a server with a port number', () => {
    const server = new Server(3001)
    expect(server.port).to.equal(3001)
    expect(server.connections.size).to.equal(0)
    expect(server.opened).to.be.true
    server.close()
    expect(server.opened).to.be.false
  })

  it('should create a server and open it later', () => {
    const server = new Server()
    expect(server.port).to.equal(undefined)
    expect(server.connections.size).to.equal(0)
    expect(server.opened).to.be.false
    server.open(httpServer)
    expect(server.opened).to.be.true
    expect(server.port).to.equal(httpServer.port)
    server.close()
    expect(server.opened).to.be.false
    expect(server.port).to.equal(undefined)
  })

  it('should create a server and connect a client to it', (done) => {
    const server = new Server(httpServer)
    const client = server.connect()
    client.on('connect', () => {
      expect(server.connections.size).to.equal(1)
      done()
      server.close()
      client.disconnect()
    })
  })

  it('should remove a connection when a client disconnects', (done) => {
    const server = new Server(httpServer)
    const client = server.connect()
    client.on('connect', () => {
      expect(server.connections.size).to.equal(1)
      client.disconnect()
    })
    client.on('disconnect', () => {
      setTimeout(() => {
        // wait for the disconnect event to be processed
        expect(server.connections.size).to.equal(0)
        server.close()
        done()
      }, 100)
    })
  })

  it('should find a connection using a search function', (done) => {
    const server = new Server(httpServer)
    server.onConnection((connection) => {
      // this test is done because the onConnection event as to return the same connection object as the one passed to the Connections Set object
      const result = server.findConnection((c) => c === connection)
      expect(result).to.equal(connection)
      client.disconnect()
      server.close()
      done()
    })
    const client = server.connect()
  })
})
