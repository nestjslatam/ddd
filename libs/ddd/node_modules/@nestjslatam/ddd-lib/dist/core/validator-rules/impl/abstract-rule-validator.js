"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractRuleValidator = void 0;
class AbstractRuleValidator {
    constructor(subject) {
        this.subject = subject;
        this.brokenRules = [];
    }
    validate() {
        this.brokenRules = [];
        if (this.subject !== null && this.subject !== undefined) {
            this.addRules();
        }
        return this.brokenRules;
    }
    addBrokenRule(propertyName, message) {
        this.brokenRules.push({
            property: propertyName,
            message: message,
            severity: 'Error',
        });
    }
    getValidatorDescriptor() {
        return this.constructor;
    }
    getSubjectDescriptor() {
        if (!this.subject) {
            throw new Error('Subject is null or undefined.');
        }
        return this.subject.constructor;
    }
}
exports.AbstractRuleValidator = AbstractRuleValidator;
//# sourceMappingURL=abstract-rule-validator.js.map