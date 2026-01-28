import { AbstractRuleValidator } from '@nestjslatam/ddd-lib';
import { Product } from '../product';

export class ProductPriceValidator extends AbstractRuleValidator<Product> {
  constructor(subject: Product) {
    super(subject);
  }

  public addRules(): void {
    if (this.subject.props.price.getValue() <= 0) {
      this.addBrokenRule('props.price', 'Price must be greater than 0');
    }

    if (this.subject.props.price.getValue() > 1000000) {
      this.addBrokenRule('props.price', 'Price must be less than 1000000');
    }

    if (this.subject.props.price.getValue() % 100 !== 0) {
      this.addBrokenRule('props.price', 'Price must be a multiple of 100');
    }
  }
}
