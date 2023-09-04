import { Server, Cluster } from './utils';
import type { IsHttpServer, IsServerInfo } from './utils/types';
import type { Space, Guard } from './types';
import { LoggerConnectionSet, SpaceMap, LoggerConnection } from '.';
export declare const log: (message: string, ...args: any[]) => void;
export declare class LoggerCluster extends Cluster<any, SpaceMap> {
    private guard;
    private readonly adminReader;
    constructor(clusterInfo: IsServerInfo | undefined, serversInfo: IsServerInfo[] | undefined, { openOnStart }: {
        openOnStart?: boolean;
    }, guard?: Guard);
    open(srv: number | IsHttpServer | IsServerInfo): this;
    getSpaceMapByServer(server: Server): SpaceMap;
    getLoggerConnectionSetBySpace(space: Space): LoggerConnectionSet;
    getSpaceByLoggerConnection(connection: LoggerConnection): Space | undefined;
    getServerByLoggerConnection(connection: LoggerConnection): Server | undefined;
    getServerBySpace(space: Space): Server | undefined;
    IsSpaceExists(space: Space): boolean;
    deleteSpaceIfEmpty(space: Space): void;
    removeByConnection(connection: LoggerConnection): void;
    removeWriterBySpace(space: Space): void;
    removeReadersBySpace(space: Space): void;
    removeSpace(space: Space): void;
    removeSpaceByConnection(connection: LoggerConnection): void;
    getWritersBySpace(space: Space): LoggerConnectionSet;
    getReadersBySpace(space: Space): LoggerConnectionSet;
    getAdmins(): LoggerConnectionSet;
    getAdminsBySpace(space: Space): LoggerConnectionSet;
    getAdminsByServer(server: Server): LoggerConnectionSet;
    getAdminsBySpaceAndServer(space: Space, server: Server): LoggerConnectionSet;
    getAdminsBySpaceOrServer(space: Space, server: Server): LoggerConnectionSet;
    sendToReadersBySpace(space: Space, data: any, evt?: string): void;
    sendToWriterBySpace(space: Space, data: any, evt?: string): void;
    readFromWriterBySpace(space: Space, callback: (data: any) => void, evt?: string): void;
    readFromReadersBySpace(space: Space, callback: (data: any) => void, evt?: string): void;
    searchServerToUse(space: Space): Server;
    addSpaceToServer(server: Server, space: Space): LoggerConnectionSet;
}
//# sourceMappingURL=cluster.socket.io.d.ts.map