import { AbstractRuleValidator } from '@nestjslatam/ddd-lib';
import { Order } from '../order-aggregate/order';
import { OrderStatus } from '../order-aggregate/order-status.enum';

export class OrderItemsValidator extends AbstractRuleValidator<Order> {
  constructor(subject: Order) {
    super(subject);
  }

  public addRules(): void {
    const items = this.subject.items;

    // A DRAFT is a cart, and a cart starts empty. Order.create() builds one
    // with `items: []` by design, and the state machine goes DRAFT ->
    // CONFIRMED, so "must have at least one item" is a rule about confirming,
    // not about drafting.
    //
    // Stated unconditionally it made a draft permanently invalid, which meant
    // POST /orders could never succeed: the aggregate rejected the very object
    // its own factory had just built.
    if (
      this.subject.status !== OrderStatus.DRAFT &&
      (!items || items.length === 0)
    ) {
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
