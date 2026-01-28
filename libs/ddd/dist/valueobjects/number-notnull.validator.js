"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NumberNotNullValidator = void 0;
const abstract_rule_validator_1 = require("../core/validator-rules/impl/abstract-rule-validator");
class NumberNotNullValidator extends abstract_rule_validator_1.AbstractRuleValidator {
    constructor(subject, options) {
        super(subject);
        this.options = {
            allowNaN: false,
            allowInfinity: false,
            propertyName: 'value',
            ...options,
        };
    }
    addRules() {
        const value = this.subject.getValue();
        const propertyName = this.options.propertyName;
        if (value === null || value === undefined) {
            this.addBrokenRule(propertyName, `${propertyName} cannot be null or undefined`);
            return;
        }
        if (!this.options.allowNaN && Number.isNaN(value)) {
            this.addBrokenRule(propertyName, `${propertyName} cannot be NaN`);
        }
        if (!this.options.allowInfinity && !Number.isFinite(value)) {
            this.addBrokenRule(propertyName, `${propertyName} must be a finite number`);
        }
    }
}
exports.NumberNotNullValidator = NumberNotNullValidator;
//# sourceMappingURL=number-notnull.validator.js.map