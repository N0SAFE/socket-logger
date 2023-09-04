import { LoggerCluster } from './cluster.socket.io'
import type { Guard, ConnectionType, Space } from './types';
import { AdvancedMap, AdvancedSet } from '../utils'
import { Connection } from './utils'

export class LoggerConnectionSet extends AdvancedSet<LoggerConnection> {}
export class SpaceMap extends AdvancedMap<Space, LoggerConnectionSet> {}
export class LoggerConnection extends Connection {
  public space?: Space
  public type?: ConnectionType
}

export function createCluster(
  clusterInfo: any = { port: 65000, path: '/' },
  serversInfo: any[] = [{ port: 65001, path: '/' }],
  { openOnStart = true }: { openOnStart?: boolean },
  guard: Guard = {},
): LoggerCluster {
  return new LoggerCluster(clusterInfo, serversInfo, { openOnStart }, guard)
}

export function createServer() {
  return undefined
}

export * from './utils'
export { LoggerCluster, Guard as LoggerClusterGuard }
