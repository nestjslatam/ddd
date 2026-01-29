"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NumberValueObject = void 0;
const valueobject_1 = require("../valueobject");
const number_notnull_validator_1 = require("./number-notnull.validator");
const number_positive_validator_1 = require("./number-positive.validator");
class NumberValueObject extends valueobject_1.DddValueObject {
    constructor(value, options) {
        super(value);
        this.options = {
            requirePositive: true,
            allowZero: false,
            allowNaN: false,
            allowInfinity: false,
            epsilon: 0,
            ...options,
        };
    }
    static create(value, options) {
        return new NumberValueObject(value, options);
    }
    static load(value, options) {
        return new NumberValueObject(value, options);
    }
    static zero(options) {
        return new NumberValueObject(0, { ...options, allowZero: true });
    }
    static one(options) {
        return new NumberValueObject(1, options);
    }
    isZero() {
        return this.getValue() === 0;
    }
    isPositive() {
        return this.getValue() > 0;
    }
    isNegative() {
        return this.getValue() < 0;
    }
    toNumber() {
        return this.getValue();
    }
    toString() {
        return this.getValue().toString();
    }
    toJSON() {
        return this.getValue();
    }
    getEqualityComponents() {
        return [this.getValue()];
    }
    addValidators() {
        super.addValidators();
        this.validatorRules.add(new number_notnull_validator_1.NumberNotNullValidator(this, {
            allowNaN: this.options.allowNaN,
            allowInfinity: this.options.allowInfinity,
        }));
        if (this.options.requirePositive) {
            this.validatorRules.add(new number_positive_validator_1.NumberPositiveValidator(this, {
                allowZero: this.options.allowZero,
                epsilon: this.options.epsilon,
            }));
        }
    }
}
exports.NumberValueObject = NumberValueObject;
//# sourceMappingURL=number.valueobject.js.map