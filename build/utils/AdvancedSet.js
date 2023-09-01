"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AdvancedSet extends Set {
    constructor(entries) {
        super(entries);
    }
    has(search) {
        if (typeof search === 'function') {
            search = search;
            for (const v of this) {
                if (search(v, this)) {
                    return true;
                }
            }
            return false;
        }
        return super.has(search);
    }
    find(search) {
        search = search;
        for (const v of this) {
            if (search(v, this)) {
                return v;
            }
        }
        return undefined;
    }
    filter(search) {
        search = search;
        const results = new AdvancedSet();
        for (const v of this) {
            if (search(v, this)) {
                results.add(v);
            }
        }
        return results;
    }
    map(search) {
        search = search;
        const results = new AdvancedSet();
        for (const v of this) {
            results.add(search(v, this));
        }
        return results;
    }
    min(search) {
        search = search;
        let min;
        let minNumber = Infinity;
        for (const v of this) {
            const number = search(v, this);
            if (number < minNumber) {
                min = v;
                minNumber = number;
            }
        }
        return min;
    }
    max(search) {
        search = search;
        let max;
        let maxNumber = -Infinity;
        for (const v of this) {
            const number = search(v, this);
            if (number > maxNumber) {
                max = v;
                maxNumber = number;
            }
        }
        return max;
    }
}
exports.default = AdvancedSet;
//# sourceMappingURL=AdvancedSet.js.map