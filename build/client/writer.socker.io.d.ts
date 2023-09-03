import { Client } from './utils';
type Payload = {
    type: 'writer';
    space: string;
    [key: string]: any;
};
export interface WriterGuard {
    sendRequestPayloadOnClusterConnect?: (payload: Payload) => Payload;
    sendRequestPayloadOnServerConnect?: (payload: Payload) => Payload;
}
declare class LoggerWriterClient extends Client {
    private readonly guard;
    constructor(info: any, options: {
        space: string;
        keepAlive: boolean;
        timeout: number;
    }, guard: WriterGuard);
}
export default LoggerWriterClient;
//# sourceMappingURL=writer.socker.io.d.ts.map