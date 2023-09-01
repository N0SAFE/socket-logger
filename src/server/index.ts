import { Guard, LoggerCluster } from './cluster.socket.io'

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

export { LoggerCluster }
