import {
  IChangeDetector,
  IProps,
  ITrackingProps,
  ITrackingStateManager,
  ITrackingStateTransitions,
} from './core/tracking-state';
import {
  TrackingStateTransition,
  NestedPropertyChangeDetector,
} from './core/tracking-state/impl';

/**
 * Manages tracking state for domain entities and value objects.
 * Implements change tracking pattern to monitor entity lifecycle states.
 *
 * This class tracks four mutually exclusive states:
 * - **New**: Entity has been created but not yet persisted
 * - **Dirty**: Entity has been modified since last persistence
 * - **SelfDeleted**: Entity has marked itself for deletion
 * - **Deleted**: Entity has been explicitly deleted
 *
 * @remarks
 * The tracking states are mutually exclusive - only one can be true at a time.
 * State transitions are managed by {@link TrackingStateTransition} to ensure consistency.
 *
 * @example
 * ```typescript
 * // Basic usage with aggregate root
 * class Order extends DddAggregateRoot<OrderProps, OrderId, OrderState> {
 *   constructor(props: OrderProps) {
 *     super(props);
 *     // trackingState is automatically available
 *   }
 *
 *   updateTotal(newTotal: Money): void {
 *     this.props.total = newTotal;
 *     this.trackingState.markAsDirty(); // Mark as modified
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Using with custom change detector
 * const customDetector: IChangeDetector = {
 *   detectChanges: (props, manager) => {
 *     // Custom change detection logic
 *     if (hasChanges(props)) {
 *       manager.setDirty(true);
 *     }
 *   }
 * };
 *
 * const trackingManager = new TrackingStateManager(customDetector);
 * ```
 *
 * @example
 * ```typescript
 * // Checking entity state
 * if (order.trackingState.isDirty) {
 *   await repository.save(order);
 * }
 *
 * if (order.trackingState.isNew) {
 *   console.log('This is a new order');
 * }
 *
 * // Get all tracking properties at once
 * const state = order.trackingState.trackingProps;
 * console.log(`State: ${JSON.stringify(state)}`);
 * ```
 */
export class TrackingStateManager
  implements ITrackingStateManager, ITrackingStateTransitions
{
  // Private fields to emulate C#'s 'private set' pattern
  private _isNew: boolean = false;
  private _isDirty: boolean = false;
  private _isSelfDeleted: boolean = false;
  private _isDeleted: boolean = false;

  /**
   * Change detector instance.
   * Injected to follow Dependency Inversion Principle (DIP).
   * Defaults to NestedPropertyChangeDetector for deep property change detection.
   */
  private readonly changeDetector: IChangeDetector;

  /**
   * Indicates if the entity is newly created and not yet persisted.
   * @returns true if entity is new, false otherwise
   *
   * @example
   * ```typescript
   * const order = new Order(props);
   * console.log(order.trackingState.isNew); // true
   *
   * await repository.save(order);
   * order.trackingState.markAsClean();
   * console.log(order.trackingState.isNew); // false
   * ```
   */
  public get isNew(): boolean {
    return this._isNew;
  }

  /**
   * Indicates if the entity has been modified since last persistence.
   * @returns true if entity has changes, false otherwise
   *
   * @example
   * ```typescript
   * order.updateQuantity(5);
   * console.log(order.trackingState.isDirty); // true
   *
   * await repository.save(order);
   * order.trackingState.markAsClean();
   * console.log(order.trackingState.isDirty); // false
   * ```
   */
  public get isDirty(): boolean {
    return this._isDirty;
  }

  /**
   * Indicates if the entity has marked itself for deletion.
   * Used when entity's business logic determines it should be deleted.
   * @returns true if entity is self-deleted, false otherwise
   *
   * @example
   * ```typescript
   * class Order {
   *   cancel(): void {
   *     this.status = OrderStatus.Cancelled;
   *     this.trackingState.markAsSelfDeleted();
   *   }
   * }
   *
   * order.cancel();
   * console.log(order.trackingState.isSelfDeleted); // true
   * ```
   */
  public get isSelfDeleted(): boolean {
    return this._isSelfDeleted;
  }

  /**
   * Indicates if the entity has been explicitly deleted.
   * Used when entity is deleted through external action (e.g., user deletion).
   * @returns true if entity is deleted, false otherwise
   *
   * @example
   * ```typescript
   * const order = await repository.findById(orderId);
   * repository.remove(order);
   * order.trackingState.markAsDeleted();
   *
   * console.log(order.trackingState.isDeleted); // true
   * ```
   */
  public get isDeleted(): boolean {
    return this._isDeleted;
  }

  /**
   * Creates a new TrackingStateManager instance.
   * Initializes entity in a clean state (no tracking flags set).
   *
   * @param changeDetector Optional custom change detector for property tracking.
   *                       Defaults to {@link NestedPropertyChangeDetector} for deep change detection.
   *
   * @example
   * ```typescript
   * // Using default detector
   * const manager = new TrackingStateManager();
   * ```
   *
   * @example
   * ```typescript
   * // Using custom detector
   * const customDetector: IChangeDetector = {
   *   detectChanges: (props, manager) => {
   *     // Custom logic
   *   }
   * };
   * const manager = new TrackingStateManager(customDetector);
   * ```
   */
  constructor(changeDetector?: IChangeDetector) {
    this.changeDetector = changeDetector || new NestedPropertyChangeDetector();
    this.markAsClean();
  }

  /**
   * Gets all tracking properties as a single object.
   * Useful for serialization, logging, or state inspection.
   *
   * @returns Snapshot of all tracking flags
   *
   * @example
   * ```typescript
   * const state = order.trackingState.trackingProps;
   * console.log(`Order state:`, state);
   * // Output: { isDirty: true, isNew: false, isDeleted: false, isSelfDeleted: false }
   * ```
   *
   * @example
   * ```typescript
   * // Using in logging
   * logger.debug('Entity state before save', {
   *   entityId: order.id.value,
   *   tracking: order.trackingState.trackingProps
   * });
   * ```
   */
  public get trackingProps(): ITrackingProps {
    return {
      isDirty: this._isDirty,
      isNew: this._isNew,
      isDeleted: this._isDeleted,
      isSelfDeleted: this._isSelfDeleted,
    };
  }

  /**
   * Analyzes properties for changes and updates tracking state accordingly.
   * Delegates change detection to the injected {@link IChangeDetector}.
   *
   * @template TProp The type of properties object to analyze
   * @param props The properties object to track for changes
   * @returns This instance for method chaining (fluent interface)
   *
   * @remarks
   * The actual change detection logic is delegated to the configured change detector.
   * By default, {@link NestedPropertyChangeDetector} performs deep comparison of nested objects.
   *
   * @example
   * ```typescript
   * class Order extends DddAggregateRoot<OrderProps, OrderId, OrderState> {
   *   updateQuantity(quantity: number): void {
   *     this.props.quantity = quantity;
   *     this.trackingState.getTracking(this.props); // Detect changes
   *   }
   * }
   * ```
   *
   * @example
   * ```typescript
   * // Method chaining
   * entity.trackingState
   *   .getTracking(entity.props)
   *   .markAsDirty();
   * ```
   */
  public getTracking<TProp extends IProps>(props: TProp): this {
    this.changeDetector.detectChanges(props, this);
    return this;
  }

  /**
   * Marks the entity as modified (dirty).
   * Resets all other tracking states to ensure state consistency.
   *
   * @remarks
   * Uses {@link TrackingStateTransition} to manage state transition logic and avoid duplication.
   * This ensures that only one tracking state is active at a time.
   *
   * @example
   * ```typescript
   * class Order extends DddAggregateRoot<OrderProps, OrderId, OrderState> {
   *   updateShippingAddress(address: Address): void {
   *     this.props.shippingAddress = address;
   *     this.trackingState.markAsDirty();
   *   }
   * }
   * ```
   *
   * @example
   * ```typescript
   * // In a command handler
   * const order = await repository.findById(orderId);
   * order.updateTotal(newTotal);
   * order.trackingState.markAsDirty();
   * await repository.save(order); // Only saves if dirty
   * ```
   */
  public markAsDirty(): void {
    TrackingStateTransition.toDirty(this);
  }

  /**
   * Marks the entity as newly created (not yet persisted).
   * Resets all other tracking states to ensure state consistency.
   *
   * @remarks
   * Uses {@link TrackingStateTransition} to manage state transition logic.
   * Typically called automatically in aggregate root constructor.
   *
   * @example
   * ```typescript
   * class Order extends DddAggregateRoot<OrderProps, OrderId, OrderState> {
   *   static create(props: CreateOrderProps): Order {
   *     const order = new Order(props);
   *     order.trackingState.markAsNew(); // Automatically marked as new
   *     return order;
   *   }
   * }
   * ```
   *
   * @example
   * ```typescript
   * // In a command handler
   * const order = Order.create(createProps);
   * console.log(order.trackingState.isNew); // true
   * await repository.save(order);
   * ```
   */
  public markAsNew(): void {
    TrackingStateTransition.toNew(this);
  }

  /**
   * Marks the entity as self-deleted (deleted by its own business logic).
   * Resets all other tracking states to ensure state consistency.
   *
   * @remarks
   * Use this when the entity determines it should be deleted based on business rules.
   * For example, when an order is cancelled, an account is closed, or a subscription expires.
   * Uses {@link TrackingStateTransition} to manage state transition logic.
   *
   * @example
   * ```typescript
   * class Order extends DddAggregateRoot<OrderProps, OrderId, OrderState> {
   *   cancel(reason: string): void {
   *     this.props.status = OrderStatus.Cancelled;
   *     this.props.cancellationReason = reason;
   *     this.trackingState.markAsSelfDeleted();
   *     this.addDomainEvent(new OrderCancelledEvent(this.id, reason));
   *   }
   * }
   * ```
   *
   * @example
   * ```typescript
   * // Automatic cleanup when business rules are violated
   * class Subscription {
   *   checkExpiration(): void {
   *     if (this.isExpired()) {
   *       this.trackingState.markAsSelfDeleted();
   *     }
   *   }
   * }
   * ```
   */
  public markAsSelfDeleted(): void {
    TrackingStateTransition.toSelfDeleted(this);
  }

  /**
   * Marks the entity as explicitly deleted (deleted by external action).
   * Resets all other tracking states to ensure state consistency.
   *
   * @remarks
   * Use this when the entity is deleted through an explicit user action or external command.
   * For example, when a user clicks "Delete", an admin removes a record, or a cascade delete occurs.
   * Uses {@link TrackingStateTransition} to manage state transition logic.
   *
   * @example
   * ```typescript
   * // In a command handler
   * class DeleteOrderHandler {
   *   async execute(command: DeleteOrderCommand): Promise<void> {
   *     const order = await repository.findById(command.orderId);
   *     order.trackingState.markAsDeleted();
   *     await repository.remove(order);
   *   }
   * }
   * ```
   *
   * @example
   * ```typescript
   * // In a repository
   * class OrderRepository {
   *   async remove(order: Order): Promise<void> {
   *     order.trackingState.markAsDeleted();
   *     await this.orm.remove(order);
   *   }
   * }
   * ```
   */
  public markAsDeleted(): void {
    TrackingStateTransition.toDeleted(this);
  }

  /**
   * Marks the entity as clean (no changes, no special state).
   * Resets all tracking states to false.
   *
   * @remarks
   * Typically called after successfully persisting an entity to the database.
   * This indicates the entity is in sync with the persistent store.
   *
   * @example
   * ```typescript
   * // In a repository after save
   * class OrderRepository {
   *   async save(order: Order): Promise<void> {
   *     await this.orm.persist(order);
   *     order.trackingState.markAsClean(); // Entity now in sync with DB
   *   }
   * }
   * ```
   *
   * @example
   * ```typescript
   * // After loading from database
   * class OrderRepository {
   *   async findById(id: OrderId): Promise<Order> {
   *     const order = await this.orm.findOne(Order, id);
   *     order.trackingState.markAsClean(); // Loaded entities start clean
   *     return order;
   *   }
   * }
   * ```
   */
  public markAsClean(): void {
    this._isDirty = false;
    this._isNew = false;
    this._isSelfDeleted = false;
    this._isDeleted = false;
  }

  /**
   * Internal setter methods for ITrackingStateTransitions interface.
   * Used exclusively by {@link TrackingStateTransition} to manage state transitions.
   *
   * @remarks
   * These methods are public only to satisfy the interface contract.
   * They should NOT be called directly by application code.
   * Use the mark* methods instead (markAsDirty, markAsNew, etc.).
   *
   * @internal
   */

  /**
   * Sets the dirty state flag.
   * @param value The dirty state value
   * @internal - Use {@link markAsDirty} instead
   */
  setDirty(value: boolean): void {
    this._isDirty = value;
  }

  /**
   * Sets the new state flag.
   * @param value The new state value
   * @internal - Use {@link markAsNew} instead
   */
  setNew(value: boolean): void {
    this._isNew = value;
  }

  /**
   * Sets the self-deleted state flag.
   * @param value The self-deleted state value
   * @internal - Use {@link markAsSelfDeleted} instead
   */
  setSelfDeleted(value: boolean): void {
    this._isSelfDeleted = value;
  }

  /**
   * Sets the deleted state flag.
   * @param value The deleted state value
   * @internal - Use {@link markAsDeleted} instead
   */
  setDeleted(value: boolean): void {
    this._isDeleted = value;
  }
}
