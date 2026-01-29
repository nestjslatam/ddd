import { BrokenRule, ClassType, IRuleValidator } from './core';
export declare class ValidatorRuleManager<TValidator extends IRuleValidator> {
    private readonly _validators;
    add(rule: TValidator): void;
    addRange(rules: TValidator[]): void;
    remove(rule: TValidator): void;
    clear(): void;
    getValidators(): ReadonlyArray<TValidator>;
    getBrokenRules(): ReadonlyArray<BrokenRule>;
    isEmpty(): boolean;
    count(): number;
    has(validatorType: ClassType<TValidator>): boolean;
    findByType(validatorType: ClassType<TValidator>): TValidator | undefined;
    private hasValidatorOfType;
    private getBrokenRuleKey;
}
//# sourceMappingURL=validator-rule.manager.d.ts.map