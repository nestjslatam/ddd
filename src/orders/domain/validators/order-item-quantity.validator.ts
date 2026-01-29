import { AbstractRuleValidator } from '@nestjslatam/ddd-lib';
import { OrderItem } from '../entities/order-item.entity';

export class OrderItemQuantityValidator extends AbstractRuleValidator<OrderItem> {
  private static readonly MIN_QUANTITY = 1;
  private static readonly MAX_QUANTITY = 10000;

  constructor(subject: OrderItem) {
    super(subject);
  }

  public addRules(): void {
    const quantity = this.subject.quantity;

    if (!Number.isInteger(quantity)) {
      this.addBrokenRule('quantity', 'Quantity must be an integer');
    }

    if (quantity < OrderItemQuantityValidator.MIN_QUANTITY) {
      this.addBrokenRule(
        'quantity',
        `Quantity must be at least ${OrderItemQuantityValidator.MIN_QUANTITY}`,
      );
    }

    if (quantity > OrderItemQuantityValidator.MAX_QUANTITY) {
      this.addBrokenRule(
        'quantity',
        `Quantity cannot exceed ${OrderItemQuantityValidator.MAX_QUANTITY}`,
      );
    }

    if (isNaN(quantity)) {
      this.addBrokenRule('quantity', 'Quantity must be a valid number');
    }
  }
}
