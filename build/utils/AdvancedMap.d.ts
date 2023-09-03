export default class AdvancedMap<K, V> extends Map<K, V> {
    constructor(entries?: readonly (readonly [K, V])[] | null);
    has(search: ((key: K, value: V, self?: this) => boolean) | K): boolean;
    find(search: ((key: K, value: V, self: this) => boolean) | K): {
        key: K;
        value: V;
    } | undefined;
    filter(search: ((key: K, value: V, self: this) => boolean) | K): AdvancedMap<K, V>;
    some(search: ((key: K, value: V, self: this) => boolean) | K): boolean;
    every(search: ((key: K, value: V, self: this) => boolean) | K): boolean;
    min(search: (key: K, value: V, self: this) => number): {
        key: K;
        value: V;
    } | undefined;
    max(search: (key: K, value: V, self: this) => number): {
        key: K;
        value: V;
    } | undefined;
}
//# sourceMappingURL=AdvancedMap.d.ts.map