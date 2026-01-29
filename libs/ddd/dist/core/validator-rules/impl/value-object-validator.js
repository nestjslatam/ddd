"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValueObjectValidator = void 0;
const valueobject_1 = require("../../../valueobject");
const abstract_validator_1 = require("./abstract-validator");
class ValueObjectValidator extends abstract_validator_1.AbstractValidator {
    validate(obj) {
        return obj instanceof valueobject_1.DddValueObject;
    }
    static isValueObject(obj) {
        return obj instanceof valueobject_1.DddValueObject;
    }
}
exports.ValueObjectValidator = ValueObjectValidator;
//# sourceMappingURL=value-object-validator.js.map