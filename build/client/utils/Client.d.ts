import { Socket } from 'socket.io-client';
import { AdvancedSocketMethods } from '../../utils/types';
import type { IsInfo } from '../../utils/types';
export interface IsAutorestartBehavior {
    restartOnDisconnect?: {
        active?: boolean;
        timeout?: number;
    };
    restartOnError?: {
        active?: boolean;
        timeout?: number;
    };
}
export default class Client implements AdvancedSocketMethods {
    info?: IsInfo | undefined;
    private socket?;
    private readonly events;
    constructor(info?: IsInfo | undefined);
    private connectErrorFn;
    private connectFn;
    private disconnectFn;
    private errorFn;
    emitOnClusterConnection(evt: string, callback: (() => any[]) | (() => Promise<any[]>) | any, ...args: any[]): this;
    emitOnServerConnection(evt: string, callback: (() => any[]) | (() => Promise<any[]>) | any, ...args: any[]): this;
    listenOnClusterConnection(evt: string, callback: (socket: Socket) => void): this;
    listenOnServerConnection(evt: string, callback: (socket: Socket) => void): this;
    connect(newInfo: IsInfo): this;
    private clearPrivateEvents;
    private removeAllListeners;
    onRedirect(callback: (info: IsInfo) => void): this;
    onServerConnect(callback: () => void): this;
    onClusterConnect(callback: () => void): this;
    onConnect(callback: () => void): this;
    onConnectOnce(callback: () => Promise<boolean> | boolean): this;
    onDisconnect(callback: () => void): this;
    onError(callback: (err: any) => void): this;
    on(event: string, callback: (...args: any[]) => void): this;
    emit(event: string, ...args: any[]): this;
    disconnect(): this;
    get connected(): boolean | undefined;
    get disconnected(): boolean | undefined;
    get id(): string | undefined;
    awaitFor(ev: string, callback?: (...args: any[]) => boolean): Promise<any>;
    request(ev: string, ...args: any[]): Promise<any>;
}
//# sourceMappingURL=Client.d.ts.map