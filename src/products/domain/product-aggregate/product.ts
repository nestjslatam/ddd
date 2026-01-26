import { BrokenRule, IdValueObject } from '@nestjslatam/ddd-lib';
import { DddAggregateRoot } from '@nestjslatam/ddd-lib/aggregate-root';

import { Description, Name, Price } from '../../../shared/valueobjects';
import { ProductStatus } from './product.status';
import { ProductPriceValidator } from './validators';

export interface IProductProps {
  name: Name;
  description: Description;
  price: Price;
  status: ProductStatus;
}

export class Product extends DddAggregateRoot<Product, IProductProps> {
  private constructor(props: IProductProps) {
    super(props);

    this.TrackingState.markAsNew();
  }

  static create(name: Name, description: Description, price: Price): Product {
    return new Product({
      name,
      description,
      price,
      status: ProductStatus.ACTIVE,
    });
  }

  load(
    id: IdValueObject,
    props: IProductProps,
    status: ProductStatus,
  ): Product {
    const product = new Product(props);
    product.Id = id;
    product.Props.status = status;

    product.TrackingState.markAsNew();

    return product;
  }

  addValidators(): void {
    this.Validators.add(new ProductPriceValidator(this));
  }

  ChangeName(name: Name): void {
    this.Props.name = name;
    this.TrackingState.markAsDirty();
  }

  ChangeDescription(description: Description): void {
    this.Props.description = description;
    this.TrackingState.markAsDirty();
  }

  ChangePrice(price: Price): void {
    this.Props.price = price;
    this.TrackingState.markAsDirty();
  }

  ChangeStatus(status: ProductStatus): void {
    this.Props.status = status;

    switch (status) {
      case ProductStatus.ACTIVE:
        if (this.Props.status === ProductStatus.ACTIVE) {
          this.BrokenRules.add(
            new BrokenRule('status', 'Status is already active', 'Error'),
          );
          break;
        }
        this.Props.status = ProductStatus.ACTIVE;
        break;
      case ProductStatus.INACTIVE:
        if (this.Props.status === ProductStatus.INACTIVE) {
          this.BrokenRules.add(
            new BrokenRule('status', 'Status is already inactive', 'Error'),
          );
          break;
        }
        this.Props.status = ProductStatus.INACTIVE;
        break;
    }
    this.TrackingState.markAsDirty();
  }
}
