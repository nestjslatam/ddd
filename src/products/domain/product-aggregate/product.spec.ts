import { Description, Name, Price } from '../../../shared/valueobjects';
import { Product } from './product';

/**
 * Regression cover for a guard that could never fire.
 *
 * `DddValueObject` declares `get isValid(): boolean`; `DddAggregateRoot`
 * declares `isValid(): boolean`. `Product.create` read it as a property, so
 * the expression tested a Function -- always truthy -- and the throw below it
 * was unreachable. Since validation only collects broken rules and never
 * throws, that guard was the only thing standing between a violated invariant
 * and a returned aggregate.
 */
describe('Product.create', () => {
  const validName = () => Name.create('Wireless Keyboard');
  const longName = () => Name.create('Mechanical Gaming Keyboard Pro Edition');
  // ProductPriceValidator requires a multiple of 100. That rule existed all
  // along but was never enforced, because the guard it fed was dead.
  const validPrice = () => Price.create(4900);

  it('returns a product when every invariant holds', () => {
    const product = Product.create(
      validName(),
      Description.create(
        'A compact wireless keyboard with a long battery life',
      ),
      validPrice(),
    );

    expect(product.isValid()).toBe(true);
    expect(product.brokenRules.getBrokenRules()).toHaveLength(0);
  });

  it('rejects a product that violates an aggregate-level invariant', () => {
    // ProductBusinessRulesValidator requires the description to be longer
    // than the name. Both value objects are individually valid, so only the
    // aggregate guard can catch this -- which is exactly what was broken.
    // Description needs at least 10 characters to be a valid value object,
    // so the name has to be longer than that for only the aggregate rule to
    // fire. Both parts are individually valid here.
    expect(() =>
      Product.create(
        longName(),
        Description.create('Compact kbd'),
        validPrice(),
      ),
    ).toThrow(/Description should be more detailed/);
  });

  it('rejects a price the domain says is invalid', () => {
    // ProductPriceValidator requires a multiple of 100. Price.create(49.99)
    // succeeds -- the value object has no such rule -- so this can only be
    // caught by the aggregate, and before the fix it never was.
    expect(() =>
      Product.create(
        validName(),
        Description.create(
          'A compact wireless keyboard with a long battery life',
        ),
        Price.create(49.99),
      ),
    ).toThrow(/multiple of 100/);
  });

  it('exposes isValid as a method, not a property', () => {
    // The shape difference between the two bases is what made the guard dead.
    // Asserting it here means a future refactor cannot silently reintroduce
    // the property form without a test failing.
    const product = Product.create(
      validName(),
      Description.create(
        'A compact wireless keyboard with a long battery life',
      ),
      validPrice(),
    );

    expect(typeof product.isValid).toBe('function');
    expect(typeof product.isValid()).toBe('boolean');
  });

  it('reports hasErrors from the call, not the function reference', () => {
    // `hasErrors: !this.isValid` was always false, so the summary claimed a
    // clean aggregate no matter what.
    const product = Product.create(
      validName(),
      Description.create(
        'A compact wireless keyboard with a long battery life',
      ),
      validPrice(),
    );

    expect(product.getStateSnapshot().hasErrors).toBe(false);
  });
});
