import { AggregateRoot } from '@nestjs/cqrs';
import { BrokenRulesManager } from './broken-rules.manager';
import { AbstractRuleValidator } from './core/validator-rules';
import { TrackingProps } from './core/tracking-state';
import { TrackingStateManager } from './tracking-state-manager';
import { ValidatorRuleManager } from './validator-rule.manager';
import { IdValueObject } from './valueobjects';
export declare abstract class DddAggregateRoot<
  TEntity,
  TProps,
  TState extends object = object,
> extends AggregateRoot {
  private _props;
  private _version;
  private readonly _trackingStateManager;
  private readonly _brokenRulesManager;
  private readonly _validatorRuleManager;
  private readonly _stateTransitionManager;
  private readonly _guardStrategy;
  private readonly _validatorsStrategy;
  private _id;
  get id(): IdValueObject;
  private set id(value);
  get props(): TProps;
  private set props(value);
  get version(): number;
  private set version(value);
  get brokenRules(): BrokenRulesManager;
  get trackingState(): TrackingStateManager;
  get validators(): ValidatorRuleManager<AbstractRuleValidator<TEntity>>;
  get propsCopy(): Readonly<
    TProps & {
      id: IdValueObject;
      props: TProps;
      trackingState: TrackingProps;
    }
  >;
  isValid(): boolean;
  protected static createValidated<T extends DddAggregateRoot<any, any, any>>(
    createFn: () => T,
  ): T;
  constructor(
    props: TProps,
    options?: {
      trackingStateManager?: TrackingStateManager;
      brokenRulesManager?: BrokenRulesManager;
      validatorRuleManager?: ValidatorRuleManager<
        AbstractRuleValidator<TEntity>
      >;
      id?: IdValueObject;
      guardStrategy?: () => void;
      validatorsStrategy?: (
        manager: ValidatorRuleManager<AbstractRuleValidator<TEntity>>,
      ) => void;
      skipInitialValidation?: boolean;
    },
  );
  validate(): void;
  protected guard(): void;
  protected addValidators(
    _manager: ValidatorRuleManager<AbstractRuleValidator<TEntity>>,
  ): void;
  equals(obj: unknown): boolean;
  private referenceEntityPropertiesEquals;
  static areEqual<T, P>(
    left: DddAggregateRoot<T, P> | null,
    right: DddAggregateRoot<T, P> | null,
  ): boolean;
  static areNotEqual<T, P>(
    left: DddAggregateRoot<T, P> | null,
    right: DddAggregateRoot<T, P> | null,
  ): boolean;
  toPlainObject(): {
    id: IdValueObject;
    version: number;
    isValid: boolean;
  } & TProps;
  toObject(): {
    id: IdValueObject;
    trackingState: TrackingStateManager;
    brokenRules: BrokenRulesManager;
    isValid: boolean;
  } & TProps;
  protected defineValidTransitions(transitions: Map<TState, TState[]>): void;
  protected canTransitionTo(currentState: TState, newState: TState): boolean;
}
//# sourceMappingURL=aggregate-root.d.ts.map
