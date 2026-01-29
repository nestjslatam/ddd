"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrokenRulesExtension = void 0;
class BrokenRulesExtension {
    static getPropertiesBrokenRules(instance, properties) {
        if (instance === null || instance === undefined) {
            throw new Error('ArgumentNullException: instance cannot be null or undefined');
        }
        if (!properties) {
            throw new Error('ArgumentNullException: properties cannot be null');
        }
        const result = [];
        for (const key of properties) {
            const valueObject = instance[key];
            if (valueObject === null || valueObject === undefined) {
                continue;
            }
            const brokenRulesManager = valueObject[this.BrokenRulesPropertyName];
            if (brokenRulesManager &&
                typeof brokenRulesManager.getBrokenRules === 'function') {
                const brokenRules = brokenRulesManager.getBrokenRules();
                if (brokenRules.length > 0) {
                    result.push(...brokenRules);
                }
            }
        }
        return Object.freeze(result);
    }
}
exports.BrokenRulesExtension = BrokenRulesExtension;
BrokenRulesExtension.BrokenRulesPropertyName = 'brokenRules';
//# sourceMappingURL=broken-rules-extension.js.map