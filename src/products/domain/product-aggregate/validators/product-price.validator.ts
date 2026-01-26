import { AbstractRuleValidator } from '@nestjslatam/ddd-lib';
import { Product } from '../product';

export class ProductPriceValidator extends AbstractRuleValidator<Product> {
  constructor(subject: Product) {
    super(subject);
  }

  public addRules(): void {
    if (this.subject.Props.price.getValue() <= 0) {
      this.addBrokenRule('Props.price', 'Price must be greater than 0');
    }

    if (this.subject.Props.price.getValue() > 1000000) {
      this.addBrokenRule('Props.price', 'Price must be less than 1000000');
    }

    if (this.subject.Props.price.getValue() % 100 !== 0) {
      this.addBrokenRule('Props.price', 'Price must be a multiple of 100');
    }
  }
}
