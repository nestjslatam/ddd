"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidatorRuleManager = void 0;
const domain_exception_1 = require("./exceptions/domain.exception");
class ValidatorRuleManager {
    constructor() {
        this._validators = [];
    }
    add(rule) {
        if (!rule) {
            throw new domain_exception_1.ArgumentNullException('rule');
        }
        if (!this.hasValidatorOfType(rule.constructor)) {
            this._validators.push(rule);
        }
    }
    addRange(rules) {
        if (!rules) {
            throw new domain_exception_1.ArgumentNullException('rules');
        }
        if (rules.length === 0) {
            return;
        }
        rules.forEach((rule) => this.add(rule));
    }
    remove(rule) {
        if (!rule) {
            throw new domain_exception_1.ArgumentNullException('rule');
        }
        const index = this._validators.indexOf(rule);
        if (index !== -1) {
            this._validators.splice(index, 1);
        }
    }
    clear() {
        this._validators.length = 0;
    }
    getValidators() {
        return Object.freeze([...this._validators]);
    }
    getBrokenRules() {
        const result = [];
        const seen = new Set();
        for (const validator of this._validators) {
            const brokenRules = validator.validate();
            if (brokenRules && brokenRules.length > 0) {
                for (const brokenRule of brokenRules) {
                    const key = this.getBrokenRuleKey(brokenRule);
                    if (!seen.has(key)) {
                        seen.add(key);
                        result.push(brokenRule);
                    }
                }
            }
        }
        return Object.freeze(result);
    }
    isEmpty() {
        return this._validators.length === 0;
    }
    count() {
        return this._validators.length;
    }
    has(validatorType) {
        return this.hasValidatorOfType(validatorType);
    }
    findByType(validatorType) {
        return this._validators.find((v) => v.constructor === validatorType);
    }
    hasValidatorOfType(validatorType) {
        return this._validators.some((v) => v.constructor === validatorType);
    }
    getBrokenRuleKey(brokenRule) {
        const property = brokenRule.property.trim().toUpperCase();
        const message = brokenRule.message.trim().toUpperCase();
        return `${property}:${message}`;
    }
}
exports.ValidatorRuleManager = ValidatorRuleManager;
//# sourceMappingURL=validator-rule.manager.js.map