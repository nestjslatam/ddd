"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DddValueObject = void 0;
const broken_rules_manager_1 = require("./broken-rules.manager");
const property_change_1 = require("./core/business-rules/impl/property-change");
const domain_exception_1 = require("./exceptions/domain.exception");
const tracking_state_manager_1 = require("./tracking-state-manager");
const validator_rule_manager_1 = require("./validator-rule.manager");
class DddValueObject extends property_change_1.AbstractNotifyPropertyChanged {
    get isValid() {
        return this.brokenRules.getBrokenRules().length === 0;
    }
    constructor(value) {
        super();
        if (value === null || value === undefined) {
            throw new domain_exception_1.ArgumentNullException('value');
        }
        this.brokenRules = new broken_rules_manager_1.BrokenRulesManager();
        this.validatorRules = new validator_rule_manager_1.ValidatorRuleManager();
        this.trackingState = new tracking_state_manager_1.TrackingStateManager();
        const valueType = this.getTypeConstructor(typeof value, value);
        this.registerProperty('internalValue', valueType, value, this.valuePropertyChanged.bind(this));
        this.trackingState.markAsNew();
        this.addValidators();
        this.validate();
    }
    valuePropertyChanged() {
        this.trackingState.markAsDirty();
        this.validate();
    }
    setValue(value) {
        if (value === null || value === undefined) {
            throw new domain_exception_1.ArgumentNullException('value');
        }
        this.setValuePropertyChanged(value, 'internalValue');
    }
    getValue() {
        return this.getValuePropertyChanged('internalValue');
    }
    addValidators() {
    }
    validate() {
        this.brokenRules.clear();
        const brokenRulesArray = this.validatorRules.getBrokenRules();
        if (brokenRulesArray && brokenRulesArray.length > 0) {
            this.brokenRules.addRange(brokenRulesArray);
        }
    }
    getTypeConstructor(typeString, value) {
        const typeMap = {
            string: String,
            number: Number,
            boolean: Boolean,
            symbol: Symbol,
            bigint: BigInt,
        };
        if (typeString in typeMap) {
            return typeMap[typeString];
        }
        if (value?.constructor) {
            return value.constructor;
        }
        return typeString;
    }
    equals(obj) {
        if (obj === null ||
            obj === undefined ||
            Object.getPrototypeOf(this) !== Object.getPrototypeOf(obj)) {
            return false;
        }
        const other = obj;
        const thisComponents = Array.from(this.getEqualityComponents());
        const otherComponents = Array.from(other.getEqualityComponents());
        if (thisComponents.length !== otherComponents.length)
            return false;
        return thisComponents.every((val, index) => val === otherComponents[index]);
    }
    getHashCode() {
        const components = Array.from(this.getEqualityComponents());
        return components.reduce((hash, item) => {
            const itemHash = item ? JSON.stringify(item).length : 0;
            return Math.trunc((hash << 5) - hash + itemHash);
        }, 0);
    }
    getCopy() {
        return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
    }
    clone() {
        return this.getCopy();
    }
}
exports.DddValueObject = DddValueObject;
//# sourceMappingURL=valueobject.js.map