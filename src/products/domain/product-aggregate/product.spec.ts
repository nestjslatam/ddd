import { Description, Name, Price } from '../../../shared/valueobjects';
import { Product } from './product';
import { ProductStatus } from './product.status';
import { BrokenRulesException } from '../../../shared/exceptions/broken-rules.exception';

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

describe('Product behaviour', () => {
  const validName = () => Name.create('Wireless Keyboard');
  const validDescription = () =>
    Description.create('A compact wireless keyboard with a long battery life');
  const validPrice = () => Price.create(49.99);
  const product = () =>
    Product.create(validName(), validDescription(), validPrice());

  describe('changing what it holds', () => {
    it('changes the name', () => {
      const item = product();
      item.ChangeName(Name.create('Mechanical Keyboard'));

      expect(item.props.name.getValue()).toBe('Mechanical Keyboard');
      expect(item.isValid).toBe(true);
    });

    it('changes the description', () => {
      const item = product();
      item.ChangeDescription(
        Description.create('A mechanical keyboard with hot-swappable switches'),
      );

      expect(item.props.description.getValue()).toContain('hot-swappable');
    });

    it('changes the price', () => {
      const item = product();
      item.ChangePrice(Price.create(89.99));

      expect(item.props.price.getValue()).toBe(89.99);
    });

    it('records, rather than throws, when a change breaks an invariant', () => {
      // The mutators COLLECT broken rules and return; they never throw. That
      // is the library's contract everywhere -- validation accumulates and
      // the caller checks isValid -- and it is why a command handler that
      // skips that check saves an aggregate that failed its own rules.
      //
      // ProductBusinessRulesValidator requires the description to be longer
      // than the name. Both value objects are individually valid here, so
      // only the aggregate can catch it.
      const item = product();

      // The rule is `descriptionLength < nameLength`, so the name has to be
      // strictly longer than the 51-character description above -- equal
      // lengths pass. Name's own maximum is 100.
      item.ChangeName(
        Name.create(
          'An extremely long product name that comfortably outruns its text',
        ),
      );

      expect(item.isValid).toBe(false);
      expect(item.brokenRules.getBrokenRules()).not.toHaveLength(0);
    });
  });

  describe('status', () => {
    it('moves between the declared statuses', () => {
      const item = product();
      item.ChangeStatus(ProductStatus.INACTIVE);

      expect(item.props.status).toBe(ProductStatus.INACTIVE);
    });

    it('records a missing status instead of throwing', () => {
      const item = product();
      item.ChangeStatus(undefined as never);

      expect(item.isValid).toBe(false);
      expect(item.brokenRules.getBrokenRules()[0].message).toContain(
        'Status cannot be null',
      );
    });

    it('records a WARNING when the status is already that one -- and that still makes it invalid', () => {
      // Worth knowing before you build on this. Re-applying the current
      // status adds a rule with severity 'Warning', and `isValid` is
      // `getBrokenRules().length === 0` -- it does not weigh severity. So a
      // warning invalidates the aggregate exactly as an error would.
      //
      // Asserted rather than changed: whether warnings should count is a
      // decision about the library's contract, not something to alter while
      // raising the sample's coverage.
      const item = product();
      item.ChangeStatus(ProductStatus.ACTIVE);

      expect(item.props.status).toBe(ProductStatus.ACTIVE);

      const rules = item.brokenRules.getBrokenRules();
      expect(rules[0].severity).toBe('Warning');
      expect(item.isValid).toBe(false);
    });
  });

  describe('deletion', () => {
    it('refuses to delete an active product', () => {
      // The rule is stated as a question the caller can ask first, and
      // markForDeletion turns a "no" into a BrokenRulesException so the
      // filter can answer 422 naming it.
      const item = product();

      expect(item.canBeDeleted()).toBe(false);
      expect(() => item.markForDeletion()).toThrow(BrokenRulesException);
      expect(() => item.markForDeletion()).toThrow(/Deactivate first/);
    });

    it('deletes an inactive one', () => {
      const item = product();
      item.ChangeStatus(ProductStatus.INACTIVE);

      expect(item.canBeDeleted()).toBe(true);

      item.markForDeletion();
      expect(item.trackingState.isDeleted).toBe(true);
    });
  });

  describe('state snapshot', () => {
    it('reports what a repository would need to decide', () => {
      const snapshot = product().getStateSnapshot();

      expect(snapshot).toEqual(
        expect.objectContaining({ isNew: true, isDirty: false }),
      );
    });
  });
});
