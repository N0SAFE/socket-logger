"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AdvancedSet_1 = __importDefault(require("../../utils/AdvancedSet"));
const chai_1 = require("chai");
describe('AdvancedSet', () => {
    it('should create an empty set', () => {
        const set = new AdvancedSet_1.default();
        (0, chai_1.expect)(set.size).to.equal(0);
    });
    it('should create a set with initial entries', () => {
        const set = new AdvancedSet_1.default(['value1', 'value2']);
        (0, chai_1.expect)(set.size).to.equal(2);
        (0, chai_1.expect)(set.has('value1')).to.be.true;
        (0, chai_1.expect)(set.has('value2')).to.be.true;
    });
    it('should find an entry using a function', () => {
        const set = new AdvancedSet_1.default(['value1', 'value2']);
        const result = set.find((value) => value === 'value2');
        (0, chai_1.expect)(result).to.equal('value2');
    });
    it('should not find an entry using a function', () => {
        const set = new AdvancedSet_1.default(['value1', 'value2']);
        const result = set.find((value) => value === 'value3');
        (0, chai_1.expect)(result).to.be.undefined;
    });
    it('should filter entries using a function', () => {
        const set = new AdvancedSet_1.default(['value1', 'value2', 'value3']);
        const result = set.filter((value) => value === 'value2' || value === 'value3');
        (0, chai_1.expect)(result.size).to.equal(2);
        (0, chai_1.expect)(result.has('value2')).to.be.true;
        (0, chai_1.expect)(result.has('value3')).to.be.true;
    });
    it('should return an empty set when filtering with no matches', () => {
        const set = new AdvancedSet_1.default(['value1', 'value2']);
        const result = set.filter((value) => value === 'value3');
        (0, chai_1.expect)(result.size).to.equal(0);
    });
    it('should return true when some entries match a function', () => {
        const set = new AdvancedSet_1.default(['value1', 'value2', 'value3']);
        const result = set.has((value) => value === 'value2' || value === 'value3');
        (0, chai_1.expect)(result).to.be.true;
    });
    it('should return false when no entries match a function', () => {
        const set = new AdvancedSet_1.default(['value1', 'value2']);
        const result = set.has((value) => value === 'value3');
        (0, chai_1.expect)(result).to.be.false;
    });
});
//# sourceMappingURL=AdvancedSet.test.js.map