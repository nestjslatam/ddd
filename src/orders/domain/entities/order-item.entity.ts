import { IdValueObject, DddValueObject } from '@nestjslatam/ddd-lib';
import { Money } from '../value-objects/money.vo';
import {
  OrderItemQuantityValidator,
  OrderItemPriceValidator,
  OrderItemProductValidator,
} from '../validators';

/**
 * Value Object representing an item within an order.
 * Contains product reference, quantity, and pricing information.
 *
 * @remarks
 * OrderItem is a value object within the Order aggregate.
 * It's identified by its productId and is part of the Order's items collection.
 *
 * @example
 * ```typescript
 * const item = OrderItem.create(
 *   productId,
 *   'Premium Widget',
 *   2,
 *   Money.fromAmount(49.99, 'USD')
 * );
 *
 * console.log(item.totalPrice.format()); // "$99.98"
 * item.changeQuantity(3);
 * ```
 */
export interface IOrderItemProps {
  /** Reference to the Product aggregate by ID (maintains aggregate boundaries) */
  productId: IdValueObject;

  /** Product name at time of order (historical record) */
  productName: string;

  /** Quantity ordered */
  quantity: number;

  /** Unit price at time of order (historical pricing) */
  unitPrice: Money;
}

export class OrderItem extends DddValueObject<IOrderItemProps> {
  private constructor(props: IOrderItemProps) {
    super(props);
  }

  /**
   * Factory method to create a new OrderItem.
   *
   * @param productId Reference to product aggregate
   * @param productName Product name for historical record
   * @param quantity Quantity ordered (must be positive)
   * @param unitPrice Price per unit
   * @returns New OrderItem instance
   */
  public static create(
    productId: IdValueObject,
    productName: string,
    quantity: number,
    unitPrice: Money,
  ): OrderItem {
    this.validateQuantity(quantity);
    this.validateProductName(productName);

    return new OrderItem({
      productId,
      productName,
      quantity,
      unitPrice,
    });
  }

  // ==================== Getters ====================

  /**
   * Gets the product ID reference.
   */
  public get productId(): IdValueObject {
    return this.getValue().productId;
  }

  /**
   * Gets the product name.
   */
  public get productName(): string {
    return this.getValue().productName;
  }

  /**
   * Gets the quantity.
   */
  public get quantity(): number {
    return this.getValue().quantity;
  }

  /**
   * Gets the unit price.
   */
  public get unitPrice(): Money {
    return this.getValue().unitPrice;
  }

  /**
   * Calculates the total price (quantity × unit price).
   */
  public get totalPrice(): Money {
    return this.unitPrice.multiply(this.quantity);
  }

  // ==================== Business Methods ====================

  /**
   * Creates a new OrderItem with a different quantity.
   * Since OrderItem is a value object (immutable), this returns a new instance.
   *
   * @param newQuantity New quantity (must be positive)
   * @returns New OrderItem with updated quantity
   */
  public withQuantity(newQuantity: number): OrderItem {
    OrderItem.validateQuantity(newQuantity);
    return OrderItem.create(
      this.productId,
      this.productName,
      newQuantity,
      this.unitPrice,
    );
  }

  /**
   * Creates a new OrderItem with quantity increased by specified amount.
   *
   * @param increment Amount to increase
   * @returns New OrderItem with increased quantity
   */
  public withIncreasedQuantity(increment: number): OrderItem {
    if (increment <= 0) {
      throw new Error('Increment must be positive');
    }
    return this.withQuantity(this.quantity + increment);
  }

  /**
   * Checks if this item is for the same product.
   *
   * @param productId Product ID to check
   * @returns True if same product
   */
  public isForProduct(productId: IdValueObject): boolean {
    return this.productId.equals(productId);
  }

  // ==================== Validation ====================

  private static validateQuantity(quantity: number): void {
    if (!Number.isInteger(quantity)) {
      throw new Error('Quantity must be an integer');
    }
    if (quantity < 1) {
      throw new Error('Quantity must be at least 1');
    }
    if (quantity > 10000) {
      throw new Error('Quantity cannot exceed 10000 per item');
    }
  }

  private static validateProductName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Product name cannot be empty');
    }
    if (name.length > 500) {
      throw new Error('Product name cannot exceed 500 characters');
    }
  }

  // ==================== Serialization ====================

  /**
   * Converts to plain object for serialization.
   */
  public toPlainObject(): any {
    return {
      productId: this.productId.getValue(),
      productName: this.productName,
      quantity: this.quantity,
      unitPrice: this.unitPrice.toJSON(),
      totalPrice: this.totalPrice.toJSON(),
    };
  }

  protected getEqualityComponents(): Iterable<any> {
    return [
      this.productId.getValue(),
      this.productName,
      this.quantity,
      this.unitPrice,
    ];
  }

  override addValidators(): void {
    super.addValidators();
    this.validatorRules.add(new OrderItemQuantityValidator(this));
    this.validatorRules.add(new OrderItemPriceValidator(this));
    this.validatorRules.add(new OrderItemProductValidator(this));
  }
}
