import { ServerOptions, Server as _Server } from 'socket.io';
import Connection from './Connection';
import { AdvancedSocketMethods } from '../../utils/types';
import type { IsHttpServer } from './types';
import Client from '../../client/utils/Client';
export default class Server extends _Server implements AdvancedSocketMethods {
    port: number | undefined;
    connections: Set<Connection>;
    opened: boolean;
    p: string;
    protected onConnectionFn: (connection: Connection) => void;
    constructor(...args: [] | [Partial<ServerOptions> & {
        serverOptions?: Partial<ServerOptions> | undefined;
    }] | [number | IsHttpServer] | [number | IsHttpServer, Partial<ServerOptions> & {
        serverOptions?: Partial<ServerOptions> | undefined;
    }]);
    onConnection(callback: (connection: Connection) => any): void;
    open(srv: number | IsHttpServer): void;
    awaitFor(eventName: any, _callback?: (...args: any[]) => boolean): Promise<unknown>;
    request(ev: string, ...args: any): Promise<unknown>;
    findConnection(search: (connection: Connection, index: number, obj: Connection[]) => boolean): Connection | undefined;
    close(): void;
    connect(): Client;
    static createHttpServer(port?: number): IsHttpServer;
}
//# sourceMappingURL=Server.d.ts.map