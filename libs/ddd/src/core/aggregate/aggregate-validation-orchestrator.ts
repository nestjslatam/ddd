import { BrokenRulesManager } from '../../broken-rules.manager';
import { AbstractRuleValidator } from '../validator-rules';
import { ValidatorRuleManager } from '../../validator-rule.manager';

/**
 * Orchestrates the validation process for aggregates.
 * Coordinates guard validations, business rules, and property validations.
 *
 * @template TEntity The entity type being validated
 *
 * @remarks
 * This class separates the concern of validation orchestration from the aggregate,
 * making the validation flow explicit and testable.
 *
 * Validation occurs in three stages:
 * 1. Guard validations (technical integrity)
 * 2. Business rule validators
 * 3. Property validations
 *
 * @example
 * ```typescript
 * const orchestrator = new AggregateValidationOrchestrator(
 *   guardFn,
 *   addValidatorsFn,
 *   brokenRulesManager,
 *   validatorRuleManager
 * );
 *
 * orchestrator.validate(aggregate);
 * ```
 */
export class AggregateValidationOrchestrator<TEntity> {
  private readonly guardStrategy: () => void;
  private readonly validatorsStrategy: (
    manager: ValidatorRuleManager<AbstractRuleValidator<TEntity>>,
  ) => void;
  private readonly brokenRulesManager: BrokenRulesManager;
  private readonly validatorRuleManager: ValidatorRuleManager<
    AbstractRuleValidator<TEntity>
  >;

  /**
   * Creates a new validation orchestrator.
   *
   * @param guardStrategy Function for guard validations
   * @param validatorsStrategy Function for adding business rule validators
   * @param brokenRulesManager Manager for collecting broken rules
   * @param validatorRuleManager Manager for validation rules
   */
  constructor(
    guardStrategy: () => void,
    validatorsStrategy: (
      manager: ValidatorRuleManager<AbstractRuleValidator<TEntity>>,
    ) => void,
    brokenRulesManager: BrokenRulesManager,
    validatorRuleManager: ValidatorRuleManager<AbstractRuleValidator<TEntity>>,
  ) {
    this.guardStrategy = guardStrategy;
    this.validatorsStrategy = validatorsStrategy;
    this.brokenRulesManager = brokenRulesManager;
    this.validatorRuleManager = validatorRuleManager;
  }

  /**
   * Executes the complete validation process.
   *
   * @param aggregate The aggregate instance for property validation
   * @returns The number of broken rules found
   */
  public validate(aggregate: any): number {
    let brokenRulesCount = 0;

    // Stage 1: Guard validations (technical integrity)
    this.guardStrategy();

    // Stage 2: Business rule validators
    this.validatorsStrategy(this.validatorRuleManager);

    // Collect business rule violations
    const entityBrokenRules = this.validatorRuleManager.getBrokenRules();
    if (entityBrokenRules.length > 0) {
      this.brokenRulesManager.addRange(entityBrokenRules);
      brokenRulesCount += entityBrokenRules.length;
    }

    // Stage 3: Property validations
    const propBrokenRules = BrokenRulesManager.getPropertiesBrokenRules(
      aggregate,
      Object.getOwnPropertyNames(
        Object.getPrototypeOf(aggregate),
      ) as (keyof typeof aggregate)[],
    );

    if (propBrokenRules.length > 0) {
      this.brokenRulesManager.addRange(propBrokenRules);
      brokenRulesCount += propBrokenRules.length;
    }

    return brokenRulesCount;
  }

  /**
   * Checks if the validation result is valid (no broken rules).
   * @returns true if valid, false otherwise
   */
  public isValid(): boolean {
    return this.brokenRulesManager.getBrokenRules().length === 0;
  }

  /**
   * Clears all broken rules.
   * Useful before re-validating.
   */
  public clearBrokenRules(): void {
    this.brokenRulesManager.clear();
  }
}

