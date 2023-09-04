import { Client } from './utils';
import type { WriterGuard } from './types';
declare class LoggerWriterClient extends Client {
    private readonly guard;
    constructor(info: any, options: {
        space: string;
        keepAlive: boolean;
        timeout: number;
    }, guard: WriterGuard);
}
export default LoggerWriterClient;
