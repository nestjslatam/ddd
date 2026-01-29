import {
  BrokenRule,
  IdValueObject,
  DddAggregateRoot,
} from '@nestjslatam/ddd-lib';

import { Description, Name, Price } from '../../../shared/valueobjects';
import { ProductStatus } from './product.status';
import {
  ProductPriceValidator,
  ProductNameValidator,
  ProductDescriptionValidator,
  ProductStatusValidator,
  ProductBusinessRulesValidator,
} from './validators';

export interface IProductProps {
  name: Name;
  description: Description;
  price: Price;
  status: ProductStatus;
}

export class Product extends DddAggregateRoot<Product, IProductProps> {
  private constructor(props: IProductProps, id?: IdValueObject) {
    super(props, { id });
    this.trackingState.markAsNew();
  }

  static create(name: Name, description: Description, price: Price): Product {
    const product = new Product({
      name,
      description,
      price,
      status: ProductStatus.ACTIVE,
    });

    // Validar el producto recién creado
    if (!product.isValid) {
      const errors = product.brokenRules.getBrokenRules();
      throw new Error(
        `Cannot create product: ${errors
          .map((e) => `${e.property}: ${e.message}`)
          .join(', ')}`,
      );
    }

    return product;
  }

  static load(
    id: IdValueObject,
    props: IProductProps,
    status: ProductStatus,
  ): Product {
    const product = new Product({ ...props, status }, id);
    product.trackingState.markAsClean();
    return product;
  }

  addValidators(): void {
    this.validators.add(new ProductNameValidator(this));
    this.validators.add(new ProductDescriptionValidator(this));
    this.validators.add(new ProductPriceValidator(this));
    this.validators.add(new ProductStatusValidator(this));
    this.validators.add(new ProductBusinessRulesValidator(this));
  }

  ChangeName(name: Name): void {
    if (!name || !name.getValue()) {
      this.brokenRules.add(
        new BrokenRule('name', 'Name cannot be null or empty', 'Error'),
      );
      return;
    }

    // Validar el nuevo nombre
    if (!name.isValid) {
      const errors = name.brokenRules.getBrokenRules();
      errors.forEach((error) => {
        this.brokenRules.add(
          new BrokenRule('name', error.message, error.severity),
        );
      });
      return;
    }

    this.props.name = name;
    this.trackingState.markAsDirty();

    // Revalidar el producto después del cambio
    this.validate();
  }

  ChangeDescription(description: Description): void {
    if (!description || !description.getValue()) {
      this.brokenRules.add(
        new BrokenRule(
          'description',
          'Description cannot be null or empty',
          'Error',
        ),
      );
      return;
    }

    // Validar la nueva descripción
    if (!description.isValid) {
      const errors = description.brokenRules.getBrokenRules();
      errors.forEach((error) => {
        this.brokenRules.add(
          new BrokenRule('description', error.message, error.severity),
        );
      });
      return;
    }

    this.props.description = description;
    this.trackingState.markAsDirty();

    // Revalidar el producto después del cambio
    this.validate();
  }

  ChangePrice(price: Price): void {
    if (!price) {
      this.brokenRules.add(
        new BrokenRule('price', 'Price cannot be null', 'Error'),
      );
      return;
    }

    // Validar el nuevo precio
    if (!price.isValid) {
      const errors = price.brokenRules.getBrokenRules();
      errors.forEach((error) => {
        this.brokenRules.add(
          new BrokenRule('price', error.message, error.severity),
        );
      });
      return;
    }

    const oldPrice = this.props.price.getValue();
    this.props.price = price;

    // Si el producto está activo y el precio baja a 0, cambiar a inactivo
    if (this.props.status === ProductStatus.ACTIVE && price.getValue() === 0) {
      this.brokenRules.add(
        new BrokenRule(
          'price',
          'Cannot set price to zero for active product. Deactivate first.',
          'Warning',
        ),
      );
      return;
    }

    this.trackingState.markAsDirty();

    // Revalidar el producto después del cambio
    this.validate();

    console.log(
      `Price changed from ${oldPrice} to ${price.getValue()} for product ${this.id.getValue()}`,
    );
  }

  ChangeStatus(status: ProductStatus): void {
    if (!status) {
      this.brokenRules.add(
        new BrokenRule('status', 'Status cannot be null', 'Error'),
      );
      return;
    }

    const currentStatus = this.props.status;

    // Validar transiciones de estado permitidas
    if (currentStatus === status) {
      this.brokenRules.add(
        new BrokenRule('status', `Product is already ${status}`, 'Warning'),
      );
      return;
    }

    switch (status) {
      case ProductStatus.ACTIVE:
        if (this.props.price.getValue() === 0) {
          this.brokenRules.add(
            new BrokenRule(
              'status',
              'Cannot activate product with zero price',
              'Error',
            ),
          );
          return;
        }
        this.props.status = ProductStatus.ACTIVE;
        console.log(
          `Product ${this.id.getValue()} activated from ${currentStatus}`,
        );
        break;

      case ProductStatus.INACTIVE:
        this.props.status = ProductStatus.INACTIVE;
        console.log(
          `Product ${this.id.getValue()} deactivated from ${currentStatus}`,
        );
        break;

      default:
        this.brokenRules.add(
          new BrokenRule('status', `Invalid status: ${status}`, 'Error'),
        );
        return;
    }

    this.trackingState.markAsDirty();

    // Revalidar después del cambio de estado
    this.validate();
  }

  /**
   * Verifica si el producto puede ser eliminado
   */
  canBeDeleted(): boolean {
    // Un producto solo puede ser eliminado si está inactivo
    if (this.props.status === ProductStatus.ACTIVE) {
      this.brokenRules.add(
        new BrokenRule(
          'status',
          'Cannot delete active product. Deactivate first.',
          'Error',
        ),
      );
      return false;
    }
    return true;
  }

  /**
   * Marca el producto para eliminación
   */
  markForDeletion(): void {
    if (!this.canBeDeleted()) {
      throw new Error(
        'Cannot mark product for deletion: ' +
          this.brokenRules
            .getBrokenRules()
            .map((r) => r.message)
            .join(', '),
      );
    }
    this.trackingState.markAsDeleted();
  }

  /**
   * Obtiene un resumen del estado actual del producto
   */
  getStateSnapshot(): {
    isNew: boolean;
    isDirty: boolean;
    isDeleted: boolean;
    hasErrors: boolean;
    errors: string[];
  } {
    return {
      isNew: this.trackingState.isNew,
      isDirty: this.trackingState.isDirty,
      isDeleted: this.trackingState.isDeleted,
      hasErrors: !this.isValid(),
      errors: this.brokenRules.getBrokenRules().map((r) => r.message),
    };
  }
}
