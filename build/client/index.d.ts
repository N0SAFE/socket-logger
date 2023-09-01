/// <reference types="node" />
import { ChildProcessWithoutNullStreams } from 'child_process';
import LoggerWriterClient, { WriterGuard } from './writer.socker.io';
import LoggerReaderClient, { ReaderGuard } from './reader.socket.io';
export declare function createAdminReader(): undefined;
export declare function createReader({ port, host, protocol, path, space, keepAlive, timeout, }: {
    port?: number | undefined;
    host: string;
    protocol?: string;
    path?: string;
    space?: string;
    keepAlive?: boolean;
    timeout?: number;
}, guard?: ReaderGuard): LoggerReaderClient;
export declare function createWriter({ port, host, protocol, path, space, keepAlive, timeout, }: {
    port: number;
    host: string;
    protocol?: string;
    path?: string;
    space?: string;
    keepAlive?: boolean;
    timeout?: number;
}, guard?: WriterGuard): LoggerWriterClient;
export declare function createServiceWriter({ port, host, protocol, path, space, keepAlive, timeout, wait, }: {
    port: number;
    host: string;
    protocol?: string;
    path?: string;
    space?: string;
    keepAlive?: boolean;
    timeout?: number;
    wait?: boolean;
}, guard: WriterGuard | undefined, { command }: {
    command: string;
}): Promise<{
    writer: LoggerWriterClient;
    subProcess: ChildProcessWithoutNullStreams;
}>;
export { LoggerReaderClient, LoggerWriterClient };
