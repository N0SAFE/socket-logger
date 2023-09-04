"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AdvancedMap extends Map {
    constructor(entries) {
        super(entries);
    }
    has(search) {
        if (typeof search === 'function') {
            search = search;
            for (const [k, v] of this) {
                if (search(k, v, this)) {
                    return true;
                }
            }
            return false;
        }
        return super.has(search);
    }
    find(search) {
        if (typeof search === 'function') {
            search = search;
            for (const [k, v] of this) {
                if (search(k, v, this)) {
                    return {
                        key: k,
                        value: v,
                    };
                }
            }
            return undefined;
        }
        const value = super.get(search);
        if (value === undefined) {
            return undefined;
        }
        return {
            key: search,
            value,
        };
    }
    filter(search) {
        if (typeof search === 'function') {
            search = search;
            const results = new AdvancedMap();
            for (const [k, v] of this) {
                if (search(k, v, this)) {
                    results.set(k, v);
                }
            }
            return results;
        }
        const value = super.get(search);
        if (value === undefined) {
            return new AdvancedMap();
        }
        return new AdvancedMap([[search, value]]);
    }
    some(search) {
        if (typeof search === 'function') {
            search = search;
            for (const [k, v] of this) {
                if (search(k, v, this)) {
                    return true;
                }
            }
            return false;
        }
        return super.has(search);
    }
    every(search) {
        if (typeof search === 'function') {
            search = search;
            for (const [k, v] of this) {
                if (!search(k, v, this)) {
                    return false;
                }
            }
            return true;
        }
        return super.has(search);
    }
    min(search) {
        search = search;
        let min = undefined;
        let minVal = undefined;
        for (const [k, v] of this) {
            const val = search(k, v, this);
            if (minVal === undefined || val < minVal) {
                min = {
                    key: k,
                    value: v,
                };
                minVal = val;
            }
        }
        return min;
    }
    max(search) {
        search = search;
        let max = undefined;
        let maxVal = undefined;
        for (const [k, v] of this) {
            const val = search(k, v, this);
            if (maxVal === undefined || val > maxVal) {
                max = {
                    key: k,
                    value: v,
                };
                maxVal = val;
            }
        }
        return max;
    }
}
exports.default = AdvancedMap;
//# sourceMappingURL=AdvancedMap.js.map