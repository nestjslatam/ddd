import { AbstractRuleValidator } from '@nestjslatam/ddd-lib';
import { OrderItem } from '../entities/order-item.entity';

export class OrderItemProductValidator extends AbstractRuleValidator<OrderItem> {
  constructor(subject: OrderItem) {
    super(subject);
  }

  public addRules(): void {
    const productId = this.subject.productId;
    const productName = this.subject.productName;

    if (!productId || !productId.getValue()) {
      this.addBrokenRule('productId', 'Product ID is required');
    }

    if (!productName || productName.trim().length === 0) {
      this.addBrokenRule('productName', 'Product name is required');
    }

    if (productName && productName.length < 3) {
      this.addBrokenRule(
        'productName',
        'Product name must be at least 3 characters',
      );
    }

    if (productName && productName.length > 500) {
      this.addBrokenRule(
        'productName',
        'Product name cannot exceed 500 characters',
      );
    }
  }
}
