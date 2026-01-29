import { AbstractRuleValidator } from '@nestjslatam/ddd-lib';
import { Price } from '../price';

export class PriceRangeValidator extends AbstractRuleValidator<Price> {
  constructor(subject: Price) {
    super(subject);
  }

  public addRules(): void {
    const value = this.subject.getValue();

    if (value < 0) {
      this.addBrokenRule('value', 'Price cannot be negative');
    }

    if (value === 0) {
      this.addBrokenRule('value', 'Price must be greater than zero');
    }

    if (value > 9999999.99) {
      this.addBrokenRule('value', 'Price exceeds maximum allowed value');
    }

    // Validar que tenga máximo 2 decimales
    const decimals = (value.toString().split('.')[1] || '').length;
    if (decimals > 2) {
      this.addBrokenRule('value', 'Price can have at most 2 decimal places');
    }
  }
}
