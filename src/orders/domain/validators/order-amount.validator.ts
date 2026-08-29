import { AbstractRuleValidator } from '@nestjslatam/ddd-lib';
import { Order } from '../order-aggregate/order';
import { OrderStatus } from '../order-aggregate/order-status.enum';

export class OrderAmountValidator extends AbstractRuleValidator<Order> {
  private static readonly MINIMUM_ORDER_AMOUNT = 10;
  private static readonly MAXIMUM_ORDER_AMOUNT = 100000;

  constructor(subject: Order) {
    super(subject);
  }

  public addRules(): void {
    const totalAmount = this.subject.totalAmount.amount;

    // Same reasoning as the item-count rule: a minimum order value is a
    // condition for confirming an order, not for opening an empty draft whose
    // total is necessarily zero.
    if (
      this.subject.status !== OrderStatus.DRAFT &&
      totalAmount < OrderAmountValidator.MINIMUM_ORDER_AMOUNT
    ) {
      this.addBrokenRule(
        'totalAmount',
        `Order amount must be at least $${OrderAmountValidator.MINIMUM_ORDER_AMOUNT}`,
      );
    }

    if (totalAmount > OrderAmountValidator.MAXIMUM_ORDER_AMOUNT) {
      this.addBrokenRule(
        'totalAmount',
        `Order amount cannot exceed $${OrderAmountValidator.MAXIMUM_ORDER_AMOUNT}`,
      );
    }

    if (isNaN(totalAmount)) {
      this.addBrokenRule('totalAmount', 'Order amount is invalid');
    }
  }
}
