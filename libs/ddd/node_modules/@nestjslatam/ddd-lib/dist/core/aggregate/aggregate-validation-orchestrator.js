"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AggregateValidationOrchestrator = void 0;
const broken_rules_manager_1 = require("../../broken-rules.manager");
class AggregateValidationOrchestrator {
    constructor(guardStrategy, validatorsStrategy, brokenRulesManager, validatorRuleManager) {
        this.guardStrategy = guardStrategy;
        this.validatorsStrategy = validatorsStrategy;
        this.brokenRulesManager = brokenRulesManager;
        this.validatorRuleManager = validatorRuleManager;
    }
    validate(aggregate) {
        let brokenRulesCount = 0;
        this.guardStrategy();
        this.validatorsStrategy(this.validatorRuleManager);
        const entityBrokenRules = this.validatorRuleManager.getBrokenRules();
        if (entityBrokenRules.length > 0) {
            this.brokenRulesManager.addRange(entityBrokenRules);
            brokenRulesCount += entityBrokenRules.length;
        }
        const propBrokenRules = broken_rules_manager_1.BrokenRulesManager.getPropertiesBrokenRules(aggregate, Object.getOwnPropertyNames(Object.getPrototypeOf(aggregate)));
        if (propBrokenRules.length > 0) {
            this.brokenRulesManager.addRange(propBrokenRules);
            brokenRulesCount += propBrokenRules.length;
        }
        return brokenRulesCount;
    }
    isValid() {
        return this.brokenRulesManager.getBrokenRules().length === 0;
    }
    clearBrokenRules() {
        this.brokenRulesManager.clear();
    }
}
exports.AggregateValidationOrchestrator = AggregateValidationOrchestrator;
//# sourceMappingURL=aggregate-validation-orchestrator.js.map