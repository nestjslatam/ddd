import { AbstractRuleValidator } from '@nestjslatam/ddd-lib';
import { Product } from '../product';

export class ProductBusinessRulesValidator extends AbstractRuleValidator<Product> {
  constructor(subject: Product) {
    super(subject);
  }

  public addRules(): void {
    // Regla de negocio: el precio no puede ser mayor a 1000 veces el nombre (longitud)
    const nameLength = this.subject.props.name.getValue().length;
    const price = this.subject.props.price.getValue();

    if (price > nameLength * 10000) {
      this.addBrokenRule(
        'props.price',
        'Price seems unrealistic for product name length',
      );
    }

    // Regla de negocio: descripción debe ser más larga que el nombre
    const descriptionLength = this.subject.props.description.getValue().length;
    if (descriptionLength < nameLength) {
      this.addBrokenRule(
        'props.description',
        'Description should be more detailed than name',
      );
    }
  }
}
