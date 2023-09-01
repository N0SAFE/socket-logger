import { Guard, LoggerCluster } from './cluster.socket.io';
export declare function createCluster(clusterInfo: any, serversInfo: any[] | undefined, { openOnStart }: {
    openOnStart?: boolean;
}, guard?: Guard): LoggerCluster;
export declare function createServer(): undefined;
export { LoggerCluster };
