"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AggregateIdentity = void 0;
const valueobjects_1 = require("../../valueobjects");
class AggregateIdentity {
    constructor(id) {
        this._id = id;
    }
    static create() {
        return new AggregateIdentity(valueobjects_1.IdValueObject.create());
    }
    static fromExisting(id) {
        return new AggregateIdentity(id);
    }
    get id() {
        return this._id;
    }
    equals(other) {
        if (other === null || other === undefined) {
            return false;
        }
        const thisId = this._id;
        const otherId = other._id;
        if (thisId === null ||
            thisId === undefined ||
            otherId === null ||
            otherId === undefined) {
            return false;
        }
        if (typeof thisId.equals === 'function') {
            return thisId.equals(otherId);
        }
        return thisId === otherId;
    }
    toString() {
        return this._id.toString();
    }
}
exports.AggregateIdentity = AggregateIdentity;
//# sourceMappingURL=aggregate-identity.js.map