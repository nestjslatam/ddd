"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringValueObject = void 0;
const valueobject_1 = require("../valueobject");
const string_notnullorempty_validator_1 = require("./string-notnullorempty.validator");
class StringValueObject extends valueobject_1.DddValueObject {
    constructor(value, options) {
        super(value);
        this.options = {
            allowEmpty: false,
            trimWhitespace: false,
            minLength: 0,
            maxLength: Number.MAX_SAFE_INTEGER,
            ...options,
        };
    }
    static create(value, options) {
        return new StringValueObject(value, options);
    }
    static load(value, options) {
        return new StringValueObject(value, options);
    }
    static empty(options) {
        return new StringValueObject('', { ...options, allowEmpty: true });
    }
    isEmpty() {
        return this.getValue() === '';
    }
    get length() {
        return this.getValue().length;
    }
    toUpperCase() {
        return this.getValue().toUpperCase();
    }
    toLowerCase() {
        return this.getValue().toLowerCase();
    }
    trim() {
        return this.getValue().trim();
    }
    contains(substring) {
        return this.getValue().includes(substring);
    }
    startsWith(prefix) {
        return this.getValue().startsWith(prefix);
    }
    endsWith(suffix) {
        return this.getValue().endsWith(suffix);
    }
    toString() {
        return this.getValue();
    }
    toJSON() {
        return this.getValue();
    }
    getEqualityComponents() {
        return [this.getValue()];
    }
    addValidators() {
        super.addValidators();
        const options = this.options || {
            allowEmpty: false,
            trimWhitespace: false,
            minLength: 0,
            maxLength: Number.MAX_SAFE_INTEGER,
        };
        this.validatorRules.add(new string_notnullorempty_validator_1.StringNotNullOrEmptyValidator(this, {
            allowEmpty: options.allowEmpty,
            trimWhitespace: options.trimWhitespace,
            minLength: options.minLength,
        }));
        if (options.maxLength !== undefined &&
            options.maxLength < Number.MAX_SAFE_INTEGER) {
            const value = this.getValue();
            if (value && value.length > options.maxLength) {
                this.validatorRules.add({
                    addRules: () => {
                        this.validatorRules['addBrokenRule']('value', `value must not exceed ${options.maxLength} characters (current length: ${value.length})`);
                    },
                });
            }
        }
    }
}
exports.StringValueObject = StringValueObject;
//# sourceMappingURL=string.valueobject.js.map