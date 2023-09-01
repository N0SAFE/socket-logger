import Server from './Server';
import { AdvancedMap } from '../../utils';
import { IsHttpServer } from '../../utils/types';
type IsServerInfo = {
    port: number;
    path?: string | undefined;
    httpServer?: never | undefined;
} | {
    httpServer: IsHttpServer;
    path?: string | undefined;
    port?: never | undefined;
};
export default class Cluster<GlobalStore, ServerStore> extends Server {
    private readonly clusterInfo;
    private readonly serversInfo;
    private readonly store;
    servers: AdvancedMap<Server, ServerStore>;
    httpServerMap: AdvancedMap<number, IsHttpServer>;
    isOpened: boolean;
    private redirectFn;
    constructor(clusterInfo?: IsServerInfo, serversInfo?: IsServerInfo[], store?: GlobalStore);
    setRedirectFn(callback: (connection: any) => void): void;
    open(serverInfo: number | IsHttpServer | IsServerInfo): this;
    close(): this;
    serverExists(serverInfo: IsServerInfo): boolean;
    findServer(verify: (server: Server, store: ServerStore) => boolean): {
        key: Server;
        value: ServerStore;
    } | undefined;
    findServerByPort(serverInfo: IsServerInfo): {
        key: Server;
        value: ServerStore;
    };
    portIsInRange(serverInfo: IsServerInfo): boolean;
    getHttpServer(serverInfo: IsServerInfo): IsHttpServer;
    pathIsAllowed(serverInfo: IsServerInfo): boolean;
    redirect(server: Server, serverToRedirect: Server, payload?: any): void;
    addServer(serverInfo: {
        port: number;
        path?: string;
    } & any): void;
    createServer(serverInfo: IsServerInfo, store?: ServerStore, callback?: ({ server, store, }: {
        server: Server;
        store: ServerStore;
    }) => void): Server;
    createServers(store: (port: number, path: string | undefined, index: number) => ServerStore, callback?: ({ server, store, }: {
        server: Server;
        store: ServerStore;
    }) => void, onServerError?: (error: Error, store: ServerStore) => void): void;
}
export {};
//# sourceMappingURL=Cluster.d.ts.map