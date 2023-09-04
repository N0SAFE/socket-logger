import { LoggerCluster } from './cluster.socket.io';
import type { Guard, ConnectionType, Space } from './types';
import { AdvancedMap, AdvancedSet } from '../utils';
import { Connection } from './utils';
export declare class LoggerConnectionSet extends AdvancedSet<LoggerConnection> {
}
export declare class SpaceMap extends AdvancedMap<Space, LoggerConnectionSet> {
}
export declare class LoggerConnection extends Connection {
    space?: Space;
    type?: ConnectionType;
}
export declare function createCluster(clusterInfo: any, serversInfo: any[] | undefined, { openOnStart }: {
    openOnStart?: boolean;
}, guard?: Guard): LoggerCluster;
export declare function createServer(): undefined;
export * from './utils';
export { LoggerCluster, Guard as LoggerClusterGuard };
//# sourceMappingURL=index.d.ts.map