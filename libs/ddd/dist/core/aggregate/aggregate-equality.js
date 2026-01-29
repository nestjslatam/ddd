"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AggregateEquality = void 0;
class AggregateEquality {
    constructor(identity, aggregateType) {
        this.identity = identity;
        this.aggregateType = aggregateType;
    }
    equals(obj) {
        if (obj === null || obj === undefined) {
            return false;
        }
        if (!(obj instanceof this.aggregateType)) {
            return false;
        }
        const typedObj = obj;
        return this.identity.equals(typedObj.identity);
    }
    static areEqual(left, right) {
        if (left === null || left === undefined) {
            return right === null || right === undefined;
        }
        if (right === null || right === undefined) {
            return false;
        }
        return left.identity.equals(right.identity);
    }
    static areNotEqual(left, right) {
        return !this.areEqual(left, right);
    }
}
exports.AggregateEquality = AggregateEquality;
//# sourceMappingURL=aggregate-equality.js.map