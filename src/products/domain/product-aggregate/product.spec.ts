import { Description, Name, Price } from '../../../shared/valueobjects';
import { Product } from './product';

/**
 * Regression cover for a guard that could never fire.
 *
 * `Product.create` once read `isValid` as a property while DddAggregateRoot
 * declared it as a method, so the expression tested a Function -- always
 * truthy -- and the throw below it was unreachable. Since validation only
 * collects broken rules and never throws, that guard was the only thing
 * standing between a violated invariant and a returned aggregate.
 *
 * The library has since unified on a getter for both bases, which is what
 * makes the shape assertion below worth keeping.
 */
describe('Product.create', () => {
  const validName = () => Name.create('Wireless Keyboard');
  const longName = () => Name.create('Mechanical Gaming Keyboard Pro Edition');
  const validPrice = () => Price.create(49.99);

  it('returns a product when every invariant holds', () => {
    const product = Product.create(
      validName(),
      Description.create(
        'A compact wireless keyboard with a long battery life',
      ),
      validPrice(),
    );

    expect(product.isValid).toBe(true);
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
    // ProductPriceValidator caps the price at 1000000, but PriceRangeValidator
    // -- the value object's own rule set -- allows up to 9999999.99. Two
    // million is therefore a perfectly valid Price that the aggregate must
    // still reject, which is the only way to prove the aggregate guard runs
    // at all. Before the fix it never did.
    expect(() =>
      Product.create(
        validName(),
        Description.create(
          'A compact wireless keyboard with a long battery life',
        ),
        Price.create(2_000_000),
      ),
    ).toThrow(/less than 1000000/);
  });

  it('exposes isValid as a getter, the same shape as a value object', () => {
    // The two bases used to disagree, and that disagreement is what made the
    // guard dead. Asserting the shape here means a future change cannot
    // reintroduce the split without a test failing.
    const product = Product.create(
      validName(),
      Description.create(
        'A compact wireless keyboard with a long battery life',
      ),
      validPrice(),
    );

    expect(typeof product.isValid).toBe('boolean');
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
