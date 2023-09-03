import { Client } from './utils';
type Payload = {
    type: 'reader';
    space: string;
    [key: string]: any;
};
export interface ReaderGuard {
    sendRequestPayloadOnClusterConnect?: (payload: Payload) => Payload;
    sendRequestPayloadOnServerConnect?: (payload: Payload) => Payload;
}
declare class LoggerReaderClient extends Client {
    private readonly guard;
    constructor(info: any, options: {
        space: string;
        keepAlive: boolean;
        timeout: number;
    }, guard?: ReaderGuard);
}
export default LoggerReaderClient;
//# sourceMappingURL=reader.socket.io.d.ts.map