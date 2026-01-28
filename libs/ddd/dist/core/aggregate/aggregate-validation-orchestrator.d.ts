import { BrokenRulesManager } from '../../broken-rules.manager';
import { AbstractRuleValidator } from '../validator-rules';
import { ValidatorRuleManager } from '../../validator-rule.manager';
export declare class AggregateValidationOrchestrator<TEntity> {
  private readonly guardStrategy;
  private readonly validatorsStrategy;
  private readonly brokenRulesManager;
  private readonly validatorRuleManager;
  constructor(
    guardStrategy: () => void,
    validatorsStrategy: (
      manager: ValidatorRuleManager<AbstractRuleValidator<TEntity>>,
    ) => void,
    brokenRulesManager: BrokenRulesManager,
    validatorRuleManager: ValidatorRuleManager<AbstractRuleValidator<TEntity>>,
  );
  validate(aggregate: any): number;
  isValid(): boolean;
  clearBrokenRules(): void;
}
//# sourceMappingURL=aggregate-validation-orchestrator.d.ts.map
