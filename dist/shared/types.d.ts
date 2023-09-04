export interface AdvancedSocketMethods {
    awaitFor(ev: string, callback?: (...args: any[]) => boolean): Promise<any>;
    request(ev: string, ...args: any[]): Promise<any>;
}
export type Promisable<T> = T | Promise<T>;
export type Undefinedable<T> = T | undefined;
