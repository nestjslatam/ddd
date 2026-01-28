import { IdValueObject } from '@nestjslatam/ddd-lib';
import { OrderStatus } from '../order-aggregate/order-status.enum';

/**
 * Domain Event: Order was created.
 * Published when a new order is initialized in DRAFT status.
 */
export class OrderCreatedEvent {
  constructor(
    public readonly orderId: IdValueObject,
    public readonly customerId: string,
    public readonly totalAmount: number,
    public readonly currency: string,
  ) {}
}

/**
 * Domain Event: Item was added to order.
 * Published when a product item is added to the order.
 */
export class OrderItemAddedEvent {
  constructor(
    public readonly orderId: IdValueObject,
    public readonly productId: IdValueObject,
    public readonly productName: string,
    public readonly quantity: number,
    public readonly unitPrice: number,
  ) {}
}

/**
 * Domain Event: Item was removed from order.
 * Published when an item is removed from the order.
 */
export class OrderItemRemovedEvent {
  constructor(
    public readonly orderId: IdValueObject,
    public readonly productId: IdValueObject,
  ) {}
}

/**
 * Domain Event: Order item quantity changed.
 * Published when the quantity of an existing item is modified.
 */
export class OrderItemQuantityChangedEvent {
  constructor(
    public readonly orderId: IdValueObject,
    public readonly productId: IdValueObject,
    public readonly oldQuantity: number,
    public readonly newQuantity: number,
  ) {}
}

/**
 * Domain Event: Order was confirmed.
 * Published when order transitions from DRAFT to CONFIRMED status.
 */
export class OrderConfirmedEvent {
  constructor(
    public readonly orderId: IdValueObject,
    public readonly confirmedAt: Date,
    public readonly totalAmount: number,
  ) {}
}

/**
 * Domain Event: Order status changed.
 * Published whenever order status transitions occur.
 */
export class OrderStatusChangedEvent {
  constructor(
    public readonly orderId: IdValueObject,
    public readonly fromStatus: OrderStatus,
    public readonly toStatus: OrderStatus,
    public readonly changedAt: Date,
  ) {}
}

/**
 * Domain Event: Order was cancelled.
 * Published when order is cancelled.
 */
export class OrderCancelledEvent {
  constructor(
    public readonly orderId: IdValueObject,
    public readonly reason: string,
    public readonly cancelledAt: Date,
  ) {}
}

/**
 * Domain Event: Order shipped.
 * Published when order status changes to SHIPPED.
 */
export class OrderShippedEvent {
  constructor(
    public readonly orderId: IdValueObject,
    public readonly trackingNumber: string | null,
    public readonly shippedAt: Date,
  ) {}
}

/**
 * Domain Event: Order delivered.
 * Published when order is successfully delivered.
 */
export class OrderDeliveredEvent {
  constructor(
    public readonly orderId: IdValueObject,
    public readonly deliveredAt: Date,
  ) {}
}
