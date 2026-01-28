import { AbstractRuleValidator } from '@nestjslatam/ddd-lib';
import { Order } from '../order-aggregate/order';

export class OrderAmountValidator extends AbstractRuleValidator<Order> {
  private static readonly MINIMUM_ORDER_AMOUNT = 10;
  private static readonly MAXIMUM_ORDER_AMOUNT = 100000;

  constructor(subject: Order) {
    super(subject);
  }

  public addRules(): void {
    const totalAmount = this.subject.totalAmount.amount;

    if (totalAmount < OrderAmountValidator.MINIMUM_ORDER_AMOUNT) {
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
