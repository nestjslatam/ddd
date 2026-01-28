import { BrokenRule } from '../../business-rules';
import { ClassType, IRuleValidator } from '../interfaces';
export declare abstract class AbstractRuleValidator<TSubject>
  implements IRuleValidator
{
  readonly subject: TSubject;
  private brokenRules;
  constructor(subject: TSubject);
  abstract addRules(): void;
  validate(): ReadonlyArray<BrokenRule>;
  addBrokenRule(propertyName: string, message: string): void;
  getValidatorDescriptor(): ClassType;
  getSubjectDescriptor(): ClassType;
}
//# sourceMappingURL=abstract-rule-validator.d.ts.map
