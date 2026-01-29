"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdValueObject = void 0;
const uuid_1 = require("uuid");
const valueobject_1 = require("../valueobject");
const domain_exception_1 = require("../exceptions/domain.exception");
class IdValueObject extends valueobject_1.DddValueObject {
    constructor(value) {
        super(value);
    }
    addValidators() {
        super.addValidators();
    }
    static create() {
        return new IdValueObject((0, uuid_1.v4)());
    }
    static load(value) {
        if (value === null || value === undefined) {
            throw new domain_exception_1.ArgumentNullException('value');
        }
        if (!(0, uuid_1.validate)(value)) {
            throw new domain_exception_1.InvalidFormatException('value', 'valid UUID v4', value);
        }
        return new IdValueObject(value);
    }
    static loadFromString(value) {
        return IdValueObject.load(value);
    }
    getEqualityComponents() {
        return [this.getValue()];
    }
    static empty() {
        return new IdValueObject('00000000-0000-0000-0000-000000000000');
    }
    static get defaultValue() {
        return IdValueObject.empty();
    }
    isEmpty() {
        return this.getValue() === '00000000-0000-0000-0000-000000000000';
    }
    isDefault() {
        return this.isEmpty();
    }
    toString() {
        return this.getValue();
    }
    toJSON() {
        return this.getValue();
    }
}
exports.IdValueObject = IdValueObject;
//# sourceMappingURL=id.valueobject.js.map