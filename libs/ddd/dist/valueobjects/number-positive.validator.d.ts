import { AbstractRuleValidator } from '../core/validator-rules/impl/abstract-rule-validator';
import { DddValueObject } from '../valueobject';
export declare class NumberPositiveValidator extends AbstractRuleValidator<
  DddValueObject<number>
> {
  private readonly options;
  constructor(
    subject: DddValueObject<number>,
    options?: Partial<NumberPositiveValidationOptions>,
  );
  addRules(): void;
}
export interface NumberPositiveValidationOptions {
  allowZero: boolean;
  propertyName: string;
  epsilon: number;
}
//# sourceMappingURL=number-positive.validator.d.ts.map
