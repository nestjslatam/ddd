"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrokenRulesManager = void 0;
const domain_exception_1 = require("./exceptions/domain.exception");
class BrokenRulesManager {
    constructor() {
        this._brokenRules = [];
    }
    add(brokenRule) {
        this.validateNotNull(brokenRule, 'brokenRule');
        if (!this.exists(brokenRule)) {
            this._brokenRules.push(brokenRule);
        }
    }
    addRange(brokenRules) {
        this.validateNotNull(brokenRules, 'brokenRules');
        brokenRules.forEach((rule) => this.add(rule));
    }
    remove(brokenRule) {
        this.validateNotNull(brokenRule, 'brokenRule');
        const index = this._brokenRules.findIndex((rule) => this.isSameRule(rule, brokenRule));
        if (index !== -1) {
            this._brokenRules.splice(index, 1);
        }
    }
    clear() {
        this._brokenRules = [];
    }
    getBrokenRules() {
        return Object.freeze([...this._brokenRules]);
    }
    hasErrors() {
        return this._brokenRules.length > 0;
    }
    getBrokenRulesAsString() {
        if (this._brokenRules.length === 0) {
            return '';
        }
        return this._brokenRules
            .map((rule) => `Property: ${rule.property}, Message: ${rule.message}`)
            .join('\n');
    }
    static getPropertiesBrokenRules(instance, properties) {
        if (instance === null || instance === undefined) {
            throw new domain_exception_1.ArgumentNullException('instance');
        }
        if (!properties) {
            throw new domain_exception_1.ArgumentNullException('properties');
        }
        const result = [];
        for (const key of properties) {
            const valueObject = instance[key];
            if (valueObject === null || valueObject === undefined) {
                continue;
            }
            const brokenRulesManager = this.extractBrokenRulesManager(valueObject);
            if (brokenRulesManager) {
                const brokenRules = brokenRulesManager.getBrokenRules();
                if (brokenRules.length > 0) {
                    result.push(...brokenRules);
                }
            }
        }
        return Object.freeze(result);
    }
    validateNotNull(value, parameterName) {
        if (value === null || value === undefined) {
            throw new domain_exception_1.ArgumentNullException(parameterName);
        }
    }
    exists(brokenRule) {
        return this._brokenRules.some((rule) => this.isSameRule(rule, brokenRule));
    }
    isSameRule(rule1, rule2) {
        return (rule1.property.toLowerCase() === rule2.property.toLowerCase() &&
            rule1.message.toLowerCase() === rule2.message.toLowerCase());
    }
    static extractBrokenRulesManager(valueObject) {
        if (typeof valueObject === 'object' &&
            valueObject !== null &&
            BrokenRulesManager.BROKEN_RULES_PROPERTY_NAME in valueObject) {
            const manager = valueObject[BrokenRulesManager.BROKEN_RULES_PROPERTY_NAME];
            if (manager &&
                typeof manager === 'object' &&
                'getBrokenRules' in manager &&
                typeof manager.getBrokenRules === 'function') {
                return manager;
            }
        }
        return null;
    }
}
exports.BrokenRulesManager = BrokenRulesManager;
BrokenRulesManager.BROKEN_RULES_PROPERTY_NAME = 'brokenRules';
//# sourceMappingURL=broken-rules.manager.js.map