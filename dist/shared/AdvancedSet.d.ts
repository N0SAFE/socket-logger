export default class AdvancedSet<V> extends Set<V> {
    constructor(entries?: readonly V[] | null);
    has(search: ((value: V, self?: this) => boolean) | V): boolean;
    find(search: (value: V, self: this) => boolean): V | undefined;
    filter(search: (value: V, self: this) => boolean): AdvancedSet<V>;
    map<T>(search: (value: V, self: this) => T): AdvancedSet<T>;
    min(search: (value: V, self: this) => number): V | undefined;
    max(search: (value: V, self: this) => number): V | undefined;
}
