import { AbstractRuleValidator } from '@nestjslatam/ddd-lib';
import { Order } from '../order-aggregate/order';

export class OrderShippingValidator extends AbstractRuleValidator<Order> {
  constructor(subject: Order) {
    super(subject);
  }

  public addRules(): void {
    const shippingAddress = this.subject.shippingAddress;

    if (!shippingAddress) {
      this.addBrokenRule('shippingAddress', 'Shipping address is required');
      return;
    }

    // El ShippingAddress value object debería tener su propia validación
    // Aquí validamos reglas de negocio a nivel de Order

    // Ejemplo: validar que la dirección esté completa para órdenes confirmadas
    if (!this.subject.isDraft()) {
      const fullAddress = shippingAddress.getFullAddress();
      if (!fullAddress || fullAddress.trim().length < 10) {
        this.addBrokenRule(
          'shippingAddress',
          'Complete shipping address is required for confirmed orders',
        );
      }
    }
  }
}
