import {
  AbstractRuleValidator,
  DddAggregateRoot,
  IdValueObject,
  NumberValueObject,
  StringValueObject,
} from './index';

/**
 * The code in the README's Quick start section, kept executable.
 *
 * The examples this replaced had seven type errors and had never compiled
 * against any published version: they called `isValid()` on an aggregate,
 * passed `DddAggregateRoot` one type argument instead of two, invoked the
 * base constructor as `super(id, props, createdAt, updatedAt)`, reached for
 * `validatorRules` on an aggregate rather than `validators`, and narrowed a
 * public `addValidators` to protected on a value object. Nothing caught any
 * of it, because nothing ran them.
 *
 * Keeping them here means the README's central claim -- that its examples
 * compile and run -- is enforced by CI rather than asserted. If the library
 * changes shape again, this file fails first.
 */

class PriceRule extends AbstractRuleValidator<Price> {
  addRules(): void {
    if (this.subject.getValue() <= 0) {
      this.addBrokenRule('value', 'Price must be greater than zero');
    }
  }
}

export class Price extends NumberValueObject {
  static create(value: number): Price {
    const price = new Price(value);
    if (!price.isValid) {
      throw new Error(price.brokenRules.getBrokenRules()[0].message);
    }
    return price;
  }

  override addValidators(): void {
    super.addValidators();
    this.validatorRules.add(new PriceRule(this));
  }
}

export class Name extends StringValueObject {
  static create(value: string): Name {
    return new Name(value);
  }
}

interface IProductProps {
  name: Name;
  price: Price;
}

class ProductRule extends AbstractRuleValidator<Product> {
  addRules(): void {
    if (this.subject.props.price.getValue() > 1_000_000) {
      this.addBrokenRule('props.price', 'Price must be less than 1000000');
    }
  }
}

export class Product extends DddAggregateRoot<Product, IProductProps> {
  private constructor(props: IProductProps, id?: IdValueObject) {
    super(props, { id });
    this.trackingState.markAsNew();
  }

  static create(name: Name, price: Price): Product {
    const product = new Product({ name, price });
    if (!product.isValid) {
      throw new Error(
        product.brokenRules
          .getBrokenRules()
          .map((r) => r.message)
          .join(', '),
      );
    }
    return product;
  }

  protected override addValidators(): void {
    this.validators.add(new ProductRule(this));
  }
}

describe("the README's Quick start example", () => {
  it('builds a valid product', () => {
    const product = Product.create(
      Name.create('Wireless Keyboard'),
      Price.create(49.99),
    );

    expect(product.isValid).toBe(true);
    expect(product.props.price.getValue()).toBe(49.99);
  });

  it('rejects a price the value object itself refuses', () => {
    // The message comes from the BASE NumberValueObject validator, not from
    // PriceRule -- `super.addValidators()` registered it first and it caught
    // zero before the subclass rule was reached. Drop that super call and
    // both rules disappear with no error at all, which is the whole reason
    // `super-add-validators` is one of the four rules `ddd validate` checks.
    expect(() => Price.create(0)).toThrow(
      'value must be a positive number (greater than zero)',
    );
  });

  it('rejects a price only the aggregate can judge', () => {
    // 2 000 000 is a perfectly valid Price on its own. The cap is an
    // aggregate-level invariant, so nothing but the aggregate can enforce it.
    expect(() =>
      Product.create(Name.create('Server Rack'), Price.create(2_000_000)),
    ).toThrow('Price must be less than 1000000');
  });

  it('exposes isValid as a getter on both bases', () => {
    // 3.0.0's breaking change. If this ever regresses to a method, the guard
    // in Product.create reads a Function -- always truthy -- and silently
    // stops working, which is exactly how it shipped broken before.
    const onAggregate = Object.getOwnPropertyDescriptor(
      DddAggregateRoot.prototype,
      'isValid',
    );
    const onValueObject = Object.getOwnPropertyDescriptor(
      Object.getPrototypeOf(NumberValueObject.prototype),
      'isValid',
    );

    expect(typeof onAggregate?.get).toBe('function');
    expect(typeof onValueObject?.get).toBe('function');
  });
});
