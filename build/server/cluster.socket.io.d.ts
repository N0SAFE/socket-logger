import { AdvancedMap, AdvancedSet } from '../utils';
import { Connection, Server, Cluster } from './utils';
export declare const log: (message: string, ...args: any[]) => void;
type Space = string;
type ConnectionType = 'writer' | 'reader' | 'admin';
declare class LoggerConnectionSet extends AdvancedSet<LoggerConnection> {
}
declare class SpaceMap extends AdvancedMap<Space, LoggerConnectionSet> {
}
declare class LoggerConnection extends Connection {
    space?: Space;
    type?: ConnectionType;
}
type AsyncGuardResponse = Promise<{
    success: true;
    message?: string;
} | {
    success: false;
    message: string;
}>;
type GuardResponse = {
    success: true;
    message?: string;
} | {
    success: false;
    message: string;
};
export interface Guard {
    verifyServerConnection?(connection: Connection): AsyncGuardResponse | GuardResponse;
    verifyServerSubscription?(connection: Connection, data: any): AsyncGuardResponse | GuardResponse;
    verifyClusterConnection?(connection: Connection): AsyncGuardResponse | GuardResponse;
}
export declare class LoggerCluster extends Cluster<any, SpaceMap> {
    private guard;
    private readonly adminReader;
    constructor(clusterInfo: any, serversInfo: any[] | undefined, { openOnStart }: {
        openOnStart?: boolean;
    }, guard?: Guard);
    open(port: number): this;
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
export {};
//# sourceMappingURL=cluster.socket.io.d.ts.map