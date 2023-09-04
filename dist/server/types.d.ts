import type { Promisable } from "../shared/types";
import type { Connection } from "./utils";
export type Space = string;
export type ConnectionType = 'writer' | 'reader' | 'admin';
export type GuardResponse = {
    success: true;
    message?: string;
} | {
    success: false;
    message: string;
};
export interface Guard {
    verifyServerConnection?(connection: Connection): Promisable<GuardResponse>;
    verifyServerSubscription?(connection: Connection, data: any): Promisable<GuardResponse>;
    verifyClusterConnection?(connection: Connection): Promisable<GuardResponse>;
}
export * as utils from './utils';
