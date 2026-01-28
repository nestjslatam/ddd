import { AbstractRuleValidator } from '@nestjslatam/ddd-lib';
import { Product } from '../product';

export class ProductDescriptionValidator extends AbstractRuleValidator<Product> {
  constructor(subject: Product) {
    super(subject);
  }

  public addRules(): void {
    const description = this.subject.props.description;

    if (!description || !description.getValue()) {
      this.addBrokenRule(
        'props.description',
        'Product description is required',
      );
    }
  }
}
