import { AggregateRoot } from '@nestjs/cqrs';
import { BrokenRulesManager } from './broken-rules.manager';
import { AbstractRuleValidator } from './core/validator-rules';
import { TrackingProps } from './core/tracking-state';
import { StateTransitionManager } from './state-transition.manager';
import { TrackingStateManager } from './tracking-state-manager';
import { ValidatorRuleManager } from './validator-rule.manager';
import { IdValueObject } from './valueobjects';

/**
 * Abstract base class for Domain-Driven Design (DDD) Aggregate Roots.
 *
 * An Aggregate Root is the entry point to an aggregate - a cluster of domain objects
 * that can be treated as a single unit. All external access to the aggregate should
 * go through the aggregate root to maintain consistency boundaries.
 *
 * @template TEntity - The entity type for validation purposes
 * @template TProps - The type of properties that define the aggregate's state
 * @template TState - The type used for state machine transitions (default: object)
 *
 * @remarks
 * This class provides:
 * - **Identity Management**: Unique identification via IdValueObject
 * - **Validation**: Guard validations and business rule validators
 * - **Change Tracking**: Monitors state changes (new, modified, deleted)
 * - **Business Rules**: Manages broken rules and validation errors
 * - **State Transitions**: State machine support for complex workflows
 * - **Encapsulation**: Protected state with controlled access
 *
 * @example
 * ```typescript
 * interface ProductProps {
 *   name: string;
 *   price: number;
 *   stock: number;
 * }
 *
 * class Product extends DddAggregateRoot<Product, ProductProps> {
 *   constructor(props: ProductProps) {
 *     super(props);
 *   }
 *
 *   protected guard(): void {
 *     if (this.props.price < 0) {
 *       throw new Error('Price cannot be negative');
 *     }
 *   }
 *
 *   protected addValidators(manager: ValidatorRuleManager<AbstractRuleValidator<Product>>): void {
 *     manager.addRule(new ProductStockValidator());
 *   }
 *
 *   public updatePrice(newPrice: number): void {
 *     this.props.price = newPrice;
 *     this.validate();
 *   }
 * }
 * ```
 *
 * @see {@link BrokenRulesManager} for managing validation errors
 * @see {@link TrackingStateManager} for change tracking
 * @see {@link StateTransitionManager} for state machine capabilities
 */
export abstract class DddAggregateRoot<
  TEntity,
  TProps,
  TState extends object = object,
> extends AggregateRoot {
  /** The aggregate's properties/state */
  private _props: TProps;

  /** Version number for optimistic concurrency control */
  private _version: number;

  /** Manages change tracking (new, modified, deleted states) */
  private readonly _trackingStateManager: TrackingStateManager;

  /** Manages collection of broken business rules */
  private readonly _brokenRulesManager: BrokenRulesManager;

  /** Manages validation rules for the aggregate */
  private readonly _validatorRuleManager: ValidatorRuleManager<
    AbstractRuleValidator<TEntity>
  >;

  /** Manages state machine transitions */
  private readonly _stateTransitionManager: StateTransitionManager<TState>;

  /** Strategy for guard validations (technical integrity checks) */
  private readonly _guardStrategy: () => void;

  /** Strategy for adding business rule validators */
  private readonly _validatorsStrategy: (
    manager: ValidatorRuleManager<AbstractRuleValidator<TEntity>>,
  ) => void;

  /** Unique identifier for the aggregate */
  private _id: IdValueObject;

  /**
   * Gets the unique identifier of the aggregate.
   * The ID is immutable after creation and forms the basis of entity equality.
   * @returns The aggregate's unique identifier
   */
  public get id(): IdValueObject {
    return this._id;
  }

  /**
   * Sets the unique identifier (private to maintain immutability).
   * @internal
   */
  private set id(value: IdValueObject) {
    this._id = value;
  }

  /**
   * Gets the aggregate's properties.
   * Direct access to props - use with caution to maintain encapsulation.
   * Consider creating specific methods for property modifications.
   * @returns The aggregate's properties object
   */
  public get props(): TProps {
    return this._props;
  }

  /**
   * Sets the aggregate's properties (private to enforce encapsulation).
   * @internal
   */
  private set props(value: TProps) {
    this._props = value;
  }

  /**
   * Gets the aggregate's version number.
   * Used for optimistic concurrency control to detect conflicting updates.
   * @returns The current version number
   */
  public get version(): number {
    return this._version;
  }

  /**
   * Sets the aggregate's version number (private for internal management).
   * @internal
   */
  private set version(value: number) {
    this._version = value;
  }

  /**
   * Gets the manager for broken business rules.
   * Use this to check validation errors and broken rules after validation.
   * @returns The broken rules manager instance
   * @example
   * ```typescript
   * product.validate();
   * if (!product.isValid()) {
   *   const errors = product.brokenRules.getBrokenRules();
   *   console.log(errors);
   * }
   * ```
   */
  public get brokenRules(): BrokenRulesManager {
    return this._brokenRulesManager;
  }

  /**
   * Gets the change tracking state manager.
   * Tracks whether the aggregate is new, modified, or marked for deletion.
   * @returns The tracking state manager instance
   * @example
   * ```typescript
   * if (product.trackingState.isNew) {
   *   // Handle new entity
   * } else if (product.trackingState.isDirty) {
   *   // Handle modified entity
   * }
   * ```
   */
  public get trackingState(): TrackingStateManager {
    return this._trackingStateManager;
  }

  /**
   * Gets the validator rule manager.
   * Use this to manually add or manage validation rules at runtime.
   * @returns The validator rule manager instance
   */
  public get validators(): ValidatorRuleManager<
    AbstractRuleValidator<TEntity>
  > {
    return this._validatorRuleManager;
  }

  /**
   * Gets a frozen (immutable) copy of the aggregate's properties.
   * Includes id, props, and tracking state information.
   * Use this when you need to pass aggregate data without allowing modifications.
   * @returns An immutable object containing the aggregate's state
   */
  public get propsCopy(): Readonly<
    TProps & { id: IdValueObject; props: TProps; trackingState: TrackingProps }
  > {
    return Object.freeze({
      props: this._props,
      id: this.id,
      trackingState: this.trackingState.trackingProps,
    } as Readonly<
      TProps & {
        id: IdValueObject;
        props: TProps;
        trackingState: TrackingProps;
      }
    >);
  }

  /**
   * Checks if the aggregate is in a valid state.
   * Returns true if there are no broken business rules.
   * @returns true if valid, false if there are validation errors
   * @example
   * ```typescript
   * product.validate();
   * if (product.isValid()) {
   *   await repository.save(product);
   * } else {
   *   throw new ValidationError(product.brokenRules.getBrokenRules());
   * }
   * ```
   */
  public isValid(): boolean {
    return this._brokenRulesManager.getBrokenRules().length === 0;
  }

  /**
   * Creates a new aggregate ensuring it is in a valid state.
   * Use this factory method instead of direct constructor for domain operations.
   * @param createFn Factory function that creates the aggregate instance
   * @returns The created and validated aggregate instance
   * @throws If validation fails, broken rules will be populated
   */
  protected static createValidated<T extends DddAggregateRoot<any, any, any>>(
    createFn: () => T,
  ): T {
    const aggregate = createFn();
    aggregate.validate();
    return aggregate;
  }

  /**
   * Constructs a new aggregate root instance.
   *
   * @param props - The initial properties for the aggregate
   * @param options - Optional configuration for dependency injection and behavior
   * @param options.trackingStateManager - Custom tracking state manager (for testing/advanced scenarios)
   * @param options.brokenRulesManager - Custom broken rules manager (for testing/advanced scenarios)
   * @param options.validatorRuleManager - Custom validator rule manager (for testing/advanced scenarios)
   * @param options.id - Existing ID (for reconstituting from persistence)
   * @param options.guardStrategy - Custom guard validation strategy
   * @param options.validatorsStrategy - Custom validators registration strategy
   * @param options.skipInitialValidation - Skip validation during construction (useful for reconstitution)
   *
   * @remarks
   * By default, validation runs during construction. Set `skipInitialValidation: true`
   * when reconstituting aggregates from the database where data is already validated.
   *
   * @example
   * ```typescript
   * // Creating a new aggregate (validates automatically)
   * const product = new Product({ name: 'Laptop', price: 999, stock: 10 });
   *
   * // Reconstituting from database (skip validation)
   * const existingProduct = new Product(
   *   { name: 'Laptop', price: 999, stock: 10 },
   *   { id: savedId, skipInitialValidation: true }
   * );
   * ```
   */
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
  ) {
    super();

    // Dependency Injection with defaults
    this._trackingStateManager =
      options?.trackingStateManager ?? new TrackingStateManager();
    this._brokenRulesManager =
      options?.brokenRulesManager ?? new BrokenRulesManager();
    this._validatorRuleManager =
      options?.validatorRuleManager ??
      new ValidatorRuleManager<AbstractRuleValidator<TEntity>>();
    this._stateTransitionManager = new StateTransitionManager<TState>();

    // Asignación inicial de identidad
    this.id = options?.id ?? IdValueObject.create();
    this._props = props;

    // Store validation strategies
    this._guardStrategy = options?.guardStrategy ?? (() => this.guard());
    this._validatorsStrategy =
      options?.validatorsStrategy ?? ((manager) => this.addValidators(manager));

    // Run initial validation unless explicitly skipped
    if (!options?.skipInitialValidation) {
      this.validate();
    }

    // Mark as new after creation
    this._trackingStateManager.markAsNew();
  }

  /**
   * Validates the aggregate by executing all validation rules.
   *
   * This method performs validation in three stages:
   * 1. **Guard validations** - Technical integrity checks (nulls, ranges, formats)
   * 2. **Business rule validators** - Domain-specific business logic validation
   * 3. **Property validators** - Validates properties marked with validation attributes
   *
   * Validation errors are collected in the `brokenRules` manager and the aggregate
   * is marked as dirty if any rules are broken.
   *
   * @remarks
   * Call this method after making changes to the aggregate's state to ensure
   * business invariants are maintained.
   *
   * @example
   * ```typescript
   * product.updatePrice(newPrice);
   * product.validate();
   * if (!product.isValid()) {
   *   throw new DomainError('Invalid product state', product.brokenRules.getBrokenRules());
   * }
   * ```
   */
  public validate(): void {
    // 1. Validaciones de integridad técnica (Guards)
    this._guardStrategy();

    // 2. Registro de reglas de negocio
    this._validatorsStrategy(this._validatorRuleManager);

    // 3. Ejecución de validadores y actualización de estado
    const entityBrokenRules = this._validatorRuleManager.getBrokenRules();

    if (entityBrokenRules.length > 0) {
      this.brokenRules.addRange(entityBrokenRules);
      this._trackingStateManager.markAsDirty();
    }

    const propBrokenRules = BrokenRulesManager.getPropertiesBrokenRules(
      this,
      Object.getOwnPropertyNames(Object.getPrototypeOf(this)) as (keyof this)[],
    );

    if (propBrokenRules.length > 0) {
      this.brokenRules.addRange(propBrokenRules);
      this._trackingStateManager.markAsDirty();
    }
  }

  /**
   * Protected method for technical integrity validations (Guards).
   * Override in subclasses or provide guardStrategy in constructor.
   */
  protected guard(): void {
    // Default: no guard validations
  }

  /**
   * Protected method for adding business rule validators.
   * Override in subclasses or provide validatorsStrategy in constructor.
   */
  protected addValidators(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _manager: ValidatorRuleManager<AbstractRuleValidator<TEntity>>,
  ): void {
    // Default: no validators
  }

  /**
   * Determines if the current aggregate is equal to another object.
   *
   * Equality is based on:
   * 1. Both objects are non-null aggregate roots
   * 2. They are of the same type (same prototype)
   * 3. They have the same identity (ID)
   *
   * @param obj - The object to compare with
   * @returns true if the objects are equal, false otherwise
   *
   * @remarks
   * This method implements identity-based equality, which is fundamental to DDD.
   * Two aggregates are considered equal if they have the same ID, regardless of
   * their property values.
   *
   * @example
   * ```typescript
   * const product1 = new Product({ name: 'Laptop' });
   * const product2 = new Product({ name: 'Desktop' });
   * const product3 = product1;
   *
   * product1.equals(product2); // false - different IDs
   * product1.equals(product3); // true - same instance
   * ```
   */
  public equals(obj: unknown): boolean {
    if (obj === null || obj === undefined) {
      return false;
    }

    // Comprobamos si el objeto es una instancia de la clase base Entity
    // (Nota: En TS la comprobación de tipos genéricos en runtime es limitada,
    // por lo que usamos el prototipo).
    if (!(obj instanceof DddAggregateRoot)) {
      return false;
    }

    // ReferenceEquals(this, obj)
    if (this === obj) {
      return true;
    }

    // GetType() != obj.GetType()
    if (Object.getPrototypeOf(this) !== Object.getPrototypeOf(obj)) {
      return false;
    }

    return this.referenceEntityPropertiesEquals(obj);
  }

  /**
   * Comparación basada en la propiedad 'Id'.
   * Para soportar ValueObjects y primitivos dentro de la entidad,
   * la Entidad DEBE delegar su igualdad al ID. Los ValueObjects internos se validan
   * por separado en la lógica de negocio.
   */
  private referenceEntityPropertiesEquals(
    obj: DddAggregateRoot<TEntity, TProps>,
  ): boolean {
    const thisId = this.id;
    const otherId = obj.id;

    if (
      thisId === null ||
      thisId === undefined ||
      otherId === null ||
      otherId === undefined
    ) {
      return false;
    }

    // Si el ID es un ValueObject (como DomainUid), usamos su propio método equals.
    // Si es un primitivo (string/number), usamos comparación estricta.
    if (typeof thisId.equals === 'function') {
      return thisId.equals(otherId);
    }

    return thisId === otherId;
  }

  /**
   * Static equality comparison that handles null/undefined cases.
   * Provides null-safe equality checking for aggregate roots.
   *
   * @param left - First aggregate to compare (can be null/undefined)
   * @param right - Second aggregate to compare (can be null/undefined)
   * @returns true if both are null/undefined or if they are equal
   *
   * @example
   * ```typescript
   * DddAggregateRoot.areEqual(product1, product2); // false
   * DddAggregateRoot.areEqual(null, null); // true
   * DddAggregateRoot.areEqual(product1, null); // false
   * ```
   */
  public static areEqual<T, P>(
    left: DddAggregateRoot<T, P> | null,
    right: DddAggregateRoot<T, P> | null,
  ): boolean {
    if (left === null || left === undefined) {
      return right === null || right === undefined;
    }
    return left.equals(right);
  }

  /**
   * Static inequality comparison that handles null/undefined cases.
   * Negation of areEqual method.
   *
   * @param left - First aggregate to compare (can be null/undefined)
   * @param right - Second aggregate to compare (can be null/undefined)
   * @returns true if aggregates are not equal
   *
   * @example
   * ```typescript
   * DddAggregateRoot.areNotEqual(product1, product2); // true
   * DddAggregateRoot.areNotEqual(null, null); // false
   * ```
   */
  public static areNotEqual<T, P>(
    left: DddAggregateRoot<T, P> | null,
    right: DddAggregateRoot<T, P> | null,
  ): boolean {
    return !this.areEqual(left, right);
  }

  /**
   * Converts the entity to a plain object suitable for serialization.
   * Note: managers (trackingState, brokenRules) are excluded as they contain
   * class instances that don't serialize well.
   * @returns A serializable object with entity data.
   */
  public toPlainObject(): {
    id: IdValueObject;
    version: number;
    isValid: boolean;
  } & TProps {
    return {
      id: this.id,
      version: this.version,
      ...this._props,
      isValid: this.isValid(),
    };
  }

  /**
   * Converts the entity to a full object including managers.
   * Use this for debugging or internal operations, not for serialization.
   * @returns An object with all entity properties including managers.
   */
  public toObject(): {
    id: IdValueObject;
    trackingState: TrackingStateManager;
    brokenRules: BrokenRulesManager;
    isValid: boolean;
  } & TProps {
    return {
      id: this.id,
      ...this._props,
      trackingState: this.trackingState,
      brokenRules: this.brokenRules,
      isValid: this.isValid(),
    };
  }

  /**
   * Defines the map of valid state transitions.
   * @param transitions Map of source state to array of allowed target states.
   */
  protected defineValidTransitions(transitions: Map<TState, TState[]>): void {
    this._stateTransitionManager.defineTransitions(transitions);
  }

  /**
   * Verifies if transition from current state to new state is valid.
   * @param currentState The current state
   * @param newState The target state
   * @returns true if transition is allowed
   */
  protected canTransitionTo(currentState: TState, newState: TState): boolean {
    return this._stateTransitionManager.canTransitionTo(currentState, newState);
  }
}
