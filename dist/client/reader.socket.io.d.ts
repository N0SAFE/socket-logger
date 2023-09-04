import { Client } from './utils';
import type { ReaderGuard } from './types';
declare class LoggerReaderClient extends Client {
    private readonly guard;
    constructor(info: any, options: {
        space: string;
        keepAlive: boolean;
        timeout: number;
    }, guard?: ReaderGuard);
}
export default LoggerReaderClient;
