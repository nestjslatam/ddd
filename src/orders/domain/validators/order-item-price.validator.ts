import { AbstractRuleValidator } from '@nestjslatam/ddd-lib';
import { OrderItem } from '../entities/order-item.entity';

export class OrderItemPriceValidator extends AbstractRuleValidator<OrderItem> {
  constructor(subject: OrderItem) {
    super(subject);
  }

  public addRules(): void {
    const unitPrice = this.subject.unitPrice;
    const totalPrice = this.subject.totalPrice;

    if (!unitPrice) {
      this.addBrokenRule('unitPrice', 'Unit price is required');
      return;
    }

    if (unitPrice.amount <= 0) {
      this.addBrokenRule('unitPrice', 'Unit price must be greater than zero');
    }

    if (unitPrice.amount > 1000000) {
      this.addBrokenRule('unitPrice', 'Unit price seems unrealistic');
    }

    // Validar que el precio total sea correcto
    const expectedTotal = unitPrice.amount * this.subject.quantity;
    if (Math.abs(totalPrice.amount - expectedTotal) > 0.01) {
      this.addBrokenRule('totalPrice', 'Total price calculation is incorrect');
    }
  }
}
