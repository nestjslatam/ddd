import { AbstractRuleValidator } from '@nestjslatam/ddd-lib';
import { Product } from '../product';
import { ProductStatus } from '../product.status';

export class ProductStatusValidator extends AbstractRuleValidator<Product> {
  constructor(subject: Product) {
    super(subject);
  }

  public addRules(): void {
    const status = this.subject.props.status;

    if (!status) {
      this.addBrokenRule('props.status', 'Product status is required');
      return;
    }

    // Validar que el status sea un valor válido
    const validStatuses = Object.values(ProductStatus);
    if (!validStatuses.includes(status)) {
      this.addBrokenRule(
        'props.status',
        `Invalid product status. Must be one of: ${validStatuses.join(', ')}`,
      );
    }

    // Regla de negocio: un producto con precio 0 no puede estar activo
    if (
      status === ProductStatus.ACTIVE &&
      this.subject.props.price.getValue() === 0
    ) {
      this.addBrokenRule(
        'props.status',
        'Cannot activate product with zero price',
      );
    }
  }
}
