import { AbstractRuleValidator } from '../core/validator-rules/impl/abstract-rule-validator';
import { DddValueObject } from '../valueobject';
export declare class NumberNotNullValidator extends AbstractRuleValidator<DddValueObject<number>> {
    private readonly options;
    constructor(subject: DddValueObject<number>, options?: Partial<NumberValidationOptions>);
    addRules(): void;
}
export interface NumberValidationOptions {
    allowNaN: boolean;
    allowInfinity: boolean;
    propertyName: string;
}
//# sourceMappingURL=number-notnull.validator.d.ts.map