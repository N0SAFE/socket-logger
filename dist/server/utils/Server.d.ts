import { Server as _Server } from 'socket.io';
import Connection from './Connection';
import { AdvancedSocketMethods } from '../../shared/types';
import type { IsHttpServer, IsServerInfo } from './types';
import Client from '../../client/utils/Client';
export default class Server extends _Server implements AdvancedSocketMethods {
    port: number | undefined;
    connections: Set<Connection>;
    opened: boolean;
    p: string;
    protected onConnectionFn: (connection: Connection) => void;
    constructor(...args: [] | [Partial<IsServerInfo>] | [number | IsHttpServer] | [number | IsHttpServer, Partial<IsServerInfo>]);
    onConnection(callback: (connection: Connection) => any): void;
    open(srv: number | IsHttpServer): void;
    awaitFor(eventName: any, _callback?: (...args: any[]) => boolean): Promise<unknown>;
    request(ev: string, ...args: any): Promise<unknown>;
    findConnection(search: (connection: Connection, index: number, obj: Connection[]) => boolean): Connection | undefined;
    close(): void;
    connect(): Client;
    static createHttpServer(port?: number): IsHttpServer;
}
