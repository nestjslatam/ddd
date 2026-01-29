import { AbstractRuleValidator } from '@nestjslatam/ddd-lib';
import { Order } from '../order-aggregate/order';

export class OrderCustomerValidator extends AbstractRuleValidator<Order> {
  constructor(subject: Order) {
    super(subject);
  }

  public addRules(): void {
    const customerInfo = this.subject.customerInfo;

    if (!customerInfo) {
      this.addBrokenRule('customerInfo', 'Customer information is required');
      return;
    }

    // Validar email
    const email = customerInfo.email;
    if (!email || email.trim().length === 0) {
      this.addBrokenRule('customerInfo.email', 'Customer email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.addBrokenRule('customerInfo.email', 'Invalid email format');
    }

    // Validar nombre
    const name = customerInfo.name;
    if (!name || name.trim().length === 0) {
      this.addBrokenRule('customerInfo.name', 'Customer name is required');
    } else if (name.length < 2) {
      this.addBrokenRule(
        'customerInfo.name',
        'Customer name must be at least 2 characters',
      );
    }

    // Validar teléfono si existe
    const phone = customerInfo.phone;
    if (phone && phone.trim().length > 0) {
      if (!/^\+?[\d\s\-\(\)]+$/.test(phone)) {
        this.addBrokenRule('customerInfo.phone', 'Invalid phone format');
      }
    }
  }
}
