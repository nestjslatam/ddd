import { AbstractRuleValidator } from '../core/validator-rules/impl/abstract-rule-validator';
import { DddValueObject } from '../valueobject';
export declare class StringNotNullOrEmptyValidator extends AbstractRuleValidator<
  DddValueObject<string>
> {
  private readonly options;
  constructor(
    subject: DddValueObject<string>,
    options?: Partial<StringValidationOptions>,
  );
  addRules(): void;
}
export interface StringValidationOptions {
  allowEmpty: boolean;
  trimWhitespace: boolean;
  minLength: number;
  propertyName: string;
}
//# sourceMappingURL=string-notnullorempty.validator.d.ts.map
