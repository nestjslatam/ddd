import {
  IdValueObject,
  BrokenRule,
  DddAggregateRoot,
} from '@nestjslatam/ddd-lib';
import { OrderStatus, canTransitionTo } from './order-status.enum';
import { OrderItem } from '../entities/order-item.entity';
import { Money } from '../value-objects/money.vo';
import { CustomerInfo } from '../value-objects/customer-info.vo';
import { ShippingAddress } from '../value-objects/shipping-address.vo';
import {
  OrderCreatedEvent,
  OrderItemAddedEvent,
  OrderItemRemovedEvent,
  OrderItemQuantityChangedEvent,
  OrderConfirmedEvent,
  OrderStatusChangedEvent,
  OrderCancelledEvent,
  OrderShippedEvent,
  OrderDeliveredEvent,
} from '../events/order.events';
import {
  OrderItemsValidator,
  OrderAmountValidator,
  OrderStatusValidator,
  OrderCustomerValidator,
  OrderShippingValidator,
} from '../validators';

/**
 * Order Aggregate Root.
 * Manages a collection of OrderItems and enforces business rules.
 *
 * @remarks
 * This aggregate demonstrates several DDD patterns:
 * - Aggregate Root: Controls all access to OrderItem entities
 * - Domain Events: Published when state changes occur
 * - State Machine: OrderStatus with validated transitions
 * - Value Objects: CustomerInfo, ShippingAddress, Money
 * - Entity References: Product referenced by ID only (maintains boundaries)
 * - Business Rules: Minimum order amount, quantity limits
 *
 * @example
 * ```typescript
 * const order = Order.create(
 *   customerInfo,
 *   shippingAddress,
 *   'USD'
 * );
 *
 * order.addItem(productId, 'Widget', 2, Money.fromAmount(49.99, 'USD'));
 * order.confirm();
 * order.ship('TRACK123');
 * ```
 */
export interface IOrderProps {
  /** Order status (DRAFT, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED) */
  status: OrderStatus;

  /** Customer information */
  customerInfo: CustomerInfo;

  /** Shipping address */
  shippingAddress: ShippingAddress;

  /** Order items collection */
  items: OrderItem[];

  /** Order currency */
  currency: string;

  /** Order confirmation timestamp */
  confirmedAt?: Date;

  /** Shipping timestamp */
  shippedAt?: Date;

  /** Delivery timestamp */
  deliveredAt?: Date;

  /** Cancellation reason */
  cancellationReason?: string;

  /** Tracking number for shipment */
  trackingNumber?: string;
}

export class Order extends DddAggregateRoot<Order, IOrderProps> {
  private static readonly MINIMUM_ORDER_AMOUNT = 10; // Minimum $10
  private static readonly MAXIMUM_ITEMS = 50; // Maximum 50 items per order

  private constructor(props: IOrderProps, id?: IdValueObject) {
    super(props, { id });
  }

  /**
   * Factory method to create a new Order in DRAFT status.
   *
   * @param customerInfo Customer information
   * @param shippingAddress Shipping address
   * @param currency Currency code (default: 'USD')
   * @returns New Order instance
   */
  public static create(
    customerInfo: CustomerInfo,
    shippingAddress: ShippingAddress,
    currency: string = 'USD',
  ): Order {
    // Validar información del cliente
    if (!customerInfo) {
      throw new Error('Customer information is required');
    }
    if (!shippingAddress) {
      throw new Error('Shipping address is required');
    }

    const order = new Order({
      status: OrderStatus.DRAFT,
      customerInfo,
      shippingAddress,
      items: [],
      currency,
    });

    // Validar el pedido recién creado
    if (!order.isValid) {
      const errors = order.brokenRules.getBrokenRules();
      throw new Error(
        `Cannot create order: ${errors
          .map((e) => `${e.property}: ${e.message}`)
          .join(', ')}`,
      );
    }

    order.apply(
      new OrderCreatedEvent(order.id, customerInfo.email, 0, currency),
    );

    return order;
  }

  /**
   * Reconstitutes an Order from persistence.
   */
  public static fromPersistence(props: IOrderProps, id: IdValueObject): Order {
    return new Order(props, id);
  }

  // ==================== Getters ====================

  public get status(): OrderStatus {
    return this.props.status;
  }

  public get customerInfo(): CustomerInfo {
    return this.props.customerInfo;
  }

  public get shippingAddress(): ShippingAddress {
    return this.props.shippingAddress;
  }

  public get items(): ReadonlyArray<OrderItem> {
    return [...this.props.items];
  }

  public get currency(): string {
    return this.props.currency;
  }

  public get confirmedAt(): Date | undefined {
    return this.props.confirmedAt;
  }

  public get shippedAt(): Date | undefined {
    return this.props.shippedAt;
  }

  public get deliveredAt(): Date | undefined {
    return this.props.deliveredAt;
  }

  public get trackingNumber(): string | undefined {
    return this.props.trackingNumber;
  }

  public get cancellationReason(): string | undefined {
    return this.props.cancellationReason;
  }

  /**
   * Calculates the total order amount.
   */
  public get totalAmount(): Money {
    const items = this.props.items;
    if (items.length === 0) {
      return Money.zero(this.currency);
    }

    return items
      .map((item) => item.totalPrice)
      .reduce((sum, price) => sum.add(price));
  }

  /**
   * Gets the total number of items in the order.
   */
  public get itemCount(): number {
    return this.props.items.length;
  }

  /**
   * Gets the total quantity of all items.
   */
  public get totalQuantity(): number {
    return this.props.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  // ==================== Business Methods: Item Management ====================

  /**
   * Adds an item to the order.
   *
   * @param productId Product reference
   * @param productName Product name
   * @param quantity Quantity to add
   * @param unitPrice Unit price
   */
  public addItem(
    productId: IdValueObject,
    productName: string,
    quantity: number,
    unitPrice: Money,
  ): void {
    this.assertCanModifyItems();
    this.assertCurrencyMatches(unitPrice);
    this.assertMaxItemsNotExceeded();

    // Check if item already exists - if so, replace with increased quantity
    const existingItemIndex = this.findItemIndexByProductId(productId);
    if (existingItemIndex !== -1) {
      const existingItem = this.props.items[existingItemIndex];
      const oldQuantity = existingItem.quantity;
      const newItem = existingItem.withIncreasedQuantity(quantity);

      // Replace the item (immutable pattern)
      this.props.items[existingItemIndex] = newItem;

      this.apply(
        new OrderItemQuantityChangedEvent(
          this.id,
          productId,
          oldQuantity,
          newItem.quantity,
        ),
      );
      return;
    }

    // Create new item
    const newItem = OrderItem.create(
      productId,
      productName,
      quantity,
      unitPrice,
    );
    this.props.items.push(newItem);

    this.apply(
      new OrderItemAddedEvent(
        this.id,
        productId,
        productName,
        quantity,
        unitPrice.amount,
      ),
    );
  }

  /**
   * Removes an item from the order.
   *
   * @param productId Product ID to remove
   */
  public removeItem(productId: IdValueObject): void {
    this.assertCanModifyItems();

    const items = this.props.items;
    const index = items.findIndex((item) => item.isForProduct(productId));

    if (index === -1) {
      throw new Error('Item not found in order');
    }

    items.splice(index, 1);

    this.apply(new OrderItemRemovedEvent(this.id, productId));
  }

  /**
   * Changes the quantity of an existing item.
   *
   * @param productId Product ID
   * @param newQuantity New quantity
   */
  public changeItemQuantity(
    productId: IdValueObject,
    newQuantity: number,
  ): void {
    this.assertCanModifyItems();

    const itemIndex = this.findItemIndexByProductId(productId);
    if (itemIndex === -1) {
      throw new Error('Item not found in order');
    }

    const oldItem = this.props.items[itemIndex];
    const oldQuantity = oldItem.quantity;
    const newItem = oldItem.withQuantity(newQuantity);

    // Replace the item (immutable pattern)
    this.props.items[itemIndex] = newItem;

    this.apply(
      new OrderItemQuantityChangedEvent(
        this.id,
        productId,
        oldQuantity,
        newQuantity,
      ),
    );
  }

  /**
   * Clears all items from the order.
   */
  public clearItems(): void {
    this.assertCanModifyItems();
    this.props.items = [];
  }

  // ==================== Business Methods: Status Transitions ====================

  /**
   * Confirms the order (DRAFT → CONFIRMED).
   * Validates minimum order amount.
   */
  public confirm(): void {
    this.assertCanTransitionTo(OrderStatus.CONFIRMED);
    this.assertHasItems();
    this.assertMeetsMinimumAmount();

    const now = new Date();
    this.props.status = OrderStatus.CONFIRMED;
    this.props.confirmedAt = now;

    this.apply(new OrderConfirmedEvent(this.id, now, this.totalAmount.amount));

    this.apply(
      new OrderStatusChangedEvent(
        this.id,
        OrderStatus.DRAFT,
        OrderStatus.CONFIRMED,
        now,
      ),
    );
  }

  /**
   * Marks order as processing (CONFIRMED → PROCESSING).
   */
  public startProcessing(): void {
    this.assertCanTransitionTo(OrderStatus.PROCESSING);
    this.changeStatus(OrderStatus.PROCESSING);
  }

  /**
   * Ships the order (PROCESSING → SHIPPED).
   *
   * @param trackingNumber Optional tracking number
   */
  public ship(trackingNumber?: string): void {
    this.assertCanTransitionTo(OrderStatus.SHIPPED);

    const now = new Date();
    this.props.status = OrderStatus.SHIPPED;
    this.props.shippedAt = now;
    this.props.trackingNumber = trackingNumber;

    this.apply(new OrderShippedEvent(this.id, trackingNumber || null, now));

    this.apply(
      new OrderStatusChangedEvent(
        this.id,
        OrderStatus.PROCESSING,
        OrderStatus.SHIPPED,
        now,
      ),
    );
  }

  /**
   * Marks order as delivered (SHIPPED → DELIVERED).
   */
  public deliver(): void {
    this.assertCanTransitionTo(OrderStatus.DELIVERED);

    const now = new Date();
    this.props.status = OrderStatus.DELIVERED;
    this.props.deliveredAt = now;

    this.apply(new OrderDeliveredEvent(this.id, now));

    this.apply(
      new OrderStatusChangedEvent(
        this.id,
        OrderStatus.SHIPPED,
        OrderStatus.DELIVERED,
        now,
      ),
    );
  }

  /**
   * Cancels the order.
   * Can be cancelled from DRAFT, CONFIRMED, or PROCESSING status.
   *
   * @param reason Cancellation reason
   */
  public cancel(reason: string): void {
    this.assertCanTransitionTo(OrderStatus.CANCELLED);

    if (!reason || reason.trim().length === 0) {
      throw new Error('Cancellation reason is required');
    }

    const oldStatus = this.status;
    const now = new Date();

    this.props.status = OrderStatus.CANCELLED;
    this.props.cancellationReason = reason;

    this.apply(new OrderCancelledEvent(this.id, reason, now));

    this.apply(
      new OrderStatusChangedEvent(
        this.id,
        oldStatus,
        OrderStatus.CANCELLED,
        now,
      ),
    );
  }

  // ==================== Query Methods ====================

  /**
   * Checks if order is in DRAFT status.
   */
  public isDraft(): boolean {
    return this.status === OrderStatus.DRAFT;
  }

  /**
   * Checks if order is confirmed.
   */
  public isConfirmed(): boolean {
    return this.status === OrderStatus.CONFIRMED;
  }

  /**
   * Checks if order can be modified (items can be added/removed).
   */
  public canModifyItems(): boolean {
    return this.status === OrderStatus.DRAFT;
  }

  /**
   * Checks if order can be cancelled.
   */
  public canBeCancelled(): boolean {
    return (
      this.status === OrderStatus.DRAFT ||
      this.status === OrderStatus.CONFIRMED ||
      this.status === OrderStatus.PROCESSING
    );
  }

  /**
   * Finds an item by product ID.
   */
  private findItemByProductId(productId: IdValueObject): OrderItem | undefined {
    return this.props.items.find((item) => item.isForProduct(productId));
  }

  /**
   * Finds the index of an item by product ID.
   * Returns -1 if not found.
   */
  private findItemIndexByProductId(productId: IdValueObject): number {
    return this.props.items.findIndex((item) => item.isForProduct(productId));
  }

  // ==================== Assertions ====================

  private assertCanModifyItems(): void {
    if (!this.canModifyItems()) {
      throw new Error(`Cannot modify items. Order is in ${this.status} status`);
    }
  }

  private assertCanTransitionTo(newStatus: OrderStatus): void {
    if (!canTransitionTo(this.status, newStatus)) {
      throw new Error(
        `Invalid status transition from ${this.status} to ${newStatus}`,
      );
    }
  }

  private assertHasItems(): void {
    if (this.props.items.length === 0) {
      throw new Error('Cannot confirm order without items');
    }
  }

  private assertMeetsMinimumAmount(): void {
    if (this.totalAmount.amount < Order.MINIMUM_ORDER_AMOUNT) {
      throw new Error(
        `Order amount must be at least ${Money.fromAmount(
          Order.MINIMUM_ORDER_AMOUNT,
          this.currency,
        ).format()}`,
      );
    }
  }

  private assertMaxItemsNotExceeded(): void {
    if (this.props.items.length >= Order.MAXIMUM_ITEMS) {
      throw new Error(
        `Cannot add more items. Maximum ${Order.MAXIMUM_ITEMS} items per order`,
      );
    }
  }

  private assertCurrencyMatches(money: Money): void {
    if (money.currency !== this.currency) {
      throw new Error(
        `Currency mismatch: Expected ${this.currency}, got ${money.currency}`,
      );
    }
  }

  /**
   * Helper to change status and publish event.
   */
  private changeStatus(newStatus: OrderStatus): void {
    const oldStatus = this.status;
    const now = new Date();

    this.props.status = newStatus;

    this.apply(new OrderStatusChangedEvent(this.id, oldStatus, newStatus, now));
  }

  // ==================== Serialization ====================

  public toPlainObject(): any {
    return {
      id: this.id.getValue(),
      status: this.status,
      customerInfo: {
        name: this.customerInfo.name,
        email: this.customerInfo.email,
        phone: this.customerInfo.phone,
      },
      shippingAddress: this.shippingAddress.getFullAddress(),
      items: this.items.map((item) => item.toPlainObject()),
      currency: this.currency,
      totalAmount: this.totalAmount.toJSON(),
      itemCount: this.itemCount,
      totalQuantity: this.totalQuantity,
      confirmedAt: this.confirmedAt?.toISOString(),
      shippedAt: this.shippedAt?.toISOString(),
      deliveredAt: this.deliveredAt?.toISOString(),
      trackingNumber: this.trackingNumber,
      cancellationReason: this.cancellationReason,
    };
  }

  addValidators(): void {
    this.validators.add(new OrderItemsValidator(this));
    this.validators.add(new OrderAmountValidator(this));
    this.validators.add(new OrderStatusValidator(this));
    this.validators.add(new OrderCustomerValidator(this));
    this.validators.add(new OrderShippingValidator(this));
  }

  /**
   * Obtiene un resumen del estado actual del pedido
   */
  public getStateSnapshot(): {
    isNew: boolean;
    isDirty: boolean;
    isDeleted: boolean;
    hasErrors: boolean;
    errors: string[];
    status: OrderStatus;
    totalAmount: number;
    itemCount: number;
  } {
    return {
      isNew: this.trackingState.isNew,
      isDirty: this.trackingState.isDirty,
      isDeleted: this.trackingState.isDeleted,
      hasErrors: !this.isValid,
      errors: this.brokenRules.getBrokenRules().map((r) => r.message),
      status: this.status,
      totalAmount: this.totalAmount.amount,
      itemCount: this.itemCount,
    };
  }
}
