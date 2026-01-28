"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringNotNullOrEmptyValidator = void 0;
const core_1 = require("../core");
class StringNotNullOrEmptyValidator extends core_1.AbstractRuleValidator {
    constructor(subject, options) {
        super(subject);
        this.options = {
            allowEmpty: false,
            trimWhitespace: false,
            minLength: 0,
            propertyName: 'value',
            ...options,
        };
    }
    addRules() {
        let value = this.subject.getValue();
        const propertyName = this.options.propertyName;
        if (value === null || value === undefined) {
            this.addBrokenRule(propertyName, `${propertyName} cannot be null or undefined`);
            return;
        }
        if (this.options.trimWhitespace) {
            value = value.trim();
        }
        if (!this.options.allowEmpty && value === '') {
            this.addBrokenRule(propertyName, `${propertyName} cannot be empty${this.options.trimWhitespace ? ' or contain only whitespace' : ''}`);
            return;
        }
        if (this.options.minLength > 0 && value.length < this.options.minLength) {
            this.addBrokenRule(propertyName, `${propertyName} must be at least ${this.options.minLength} character${this.options.minLength === 1 ? '' : 's'} long (current length: ${value.length})`);
        }
    }
}
exports.StringNotNullOrEmptyValidator = StringNotNullOrEmptyValidator;
//# sourceMappingURL=string-notnullorempty.validator.js.map