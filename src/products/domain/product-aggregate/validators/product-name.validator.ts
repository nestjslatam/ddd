import { AbstractRuleValidator } from '@nestjslatam/ddd-lib';
import { Product } from '../product';

export class ProductNameValidator extends AbstractRuleValidator<Product> {
  constructor(subject: Product) {
    super(subject);
  }

  public addRules(): void {
    const name = this.subject.props.name;

    if (!name || !name.getValue()) {
      this.addBrokenRule('props.name', 'Product name is required');
    }
  }
}
