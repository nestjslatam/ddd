import { AbstractRuleValidator } from '@nestjslatam/ddd-lib';
import { Order } from '../order-aggregate/order';

export class OrderItemsValidator extends AbstractRuleValidator<Order> {
  constructor(subject: Order) {
    super(subject);
  }

  public addRules(): void {
    const items = this.subject.items;

    if (!items || items.length === 0) {
      this.addBrokenRule('items', 'Order must have at least one item');
    }

    if (items && items.length > 50) {
      this.addBrokenRule('items', 'Order cannot have more than 50 items');
    }

    // Verificar que no haya items duplicados
    const productIds = items.map((item) => (item as any).productId.getValue());
    const uniqueIds = new Set(productIds);
    if (productIds.length !== uniqueIds.size) {
      this.addBrokenRule('items', 'Order contains duplicate items');
    }
  }
}
