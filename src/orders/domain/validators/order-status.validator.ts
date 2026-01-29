import { AbstractRuleValidator } from '@nestjslatam/ddd-lib';
import { Order } from '../order-aggregate/order';
import { OrderStatus } from '../order-aggregate/order-status.enum';

export class OrderStatusValidator extends AbstractRuleValidator<Order> {
  constructor(subject: Order) {
    super(subject);
  }

  public addRules(): void {
    const status = this.subject.status;

    // Validar que el status exista
    const validStatuses = Object.values(OrderStatus);
    if (!validStatuses.includes(status)) {
      this.addBrokenRule('status', `Invalid order status: ${status}`);
      return;
    }

    // Validaciones específicas por estado
    switch (status) {
      case OrderStatus.CONFIRMED:
        if (this.subject.items.length === 0) {
          this.addBrokenRule('status', 'Cannot confirm order without items');
        }
        if (!this.subject.confirmedAt) {
          this.addBrokenRule(
            'confirmedAt',
            'Confirmed order must have confirmation date',
          );
        }
        break;

      case OrderStatus.SHIPPED:
        if (!this.subject.shippedAt) {
          this.addBrokenRule(
            'shippedAt',
            'Shipped order must have shipping date',
          );
        }
        if (!this.subject.confirmedAt) {
          this.addBrokenRule(
            'status',
            'Cannot ship order that was not confirmed',
          );
        }
        break;

      case OrderStatus.DELIVERED:
        if (!this.subject.deliveredAt) {
          this.addBrokenRule(
            'deliveredAt',
            'Delivered order must have delivery date',
          );
        }
        if (!this.subject.shippedAt) {
          this.addBrokenRule(
            'status',
            'Cannot deliver order that was not shipped',
          );
        }
        break;

      case OrderStatus.CANCELLED:
        if (!this.subject.cancellationReason) {
          this.addBrokenRule(
            'cancellationReason',
            'Cancelled order must have cancellation reason',
          );
        }
        break;
    }
  }
}
