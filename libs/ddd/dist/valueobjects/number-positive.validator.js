"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NumberPositiveValidator = void 0;
const abstract_rule_validator_1 = require("../core/validator-rules/impl/abstract-rule-validator");
class NumberPositiveValidator extends abstract_rule_validator_1.AbstractRuleValidator {
    constructor(subject, options) {
        super(subject);
        this.options = {
            allowZero: false,
            propertyName: 'value',
            epsilon: 0,
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
        if (Number.isNaN(value)) {
            this.addBrokenRule(propertyName, `${propertyName} cannot be NaN`);
            return;
        }
        if (!Number.isFinite(value)) {
            this.addBrokenRule(propertyName, `${propertyName} must be a finite number`);
            return;
        }
        if (this.options.allowZero) {
            if (value < -this.options.epsilon) {
                this.addBrokenRule(propertyName, `${propertyName} must be non-negative (greater than or equal to zero)`);
            }
        }
        else {
            if (value <= this.options.epsilon) {
                this.addBrokenRule(propertyName, `${propertyName} must be a positive number (greater than zero)`);
            }
        }
    }
}
exports.NumberPositiveValidator = NumberPositiveValidator;
//# sourceMappingURL=number-positive.validator.js.map