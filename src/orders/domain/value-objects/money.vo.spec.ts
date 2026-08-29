import { Money } from './money.vo';

/**
 * Money stores cents as an integer, which is the whole point of the pattern:
 * `0.1 + 0.2 !== 0.3` in binary floating point, and a currency amount that
 * drifts by a cent per operation is a bug that only shows up in an invoice
 * total months later.
 *
 * These tests exist because none of `src/` was measured for coverage at all --
 * `collectCoverageFrom` named only `libs/ddd/src`, so the sample's 8.5% never
 * appeared next to the library's 98.6%.
 */
describe('Money', () => {
  describe('construction', () => {
    it('rounds a decimal amount to cents', () => {
      expect(Money.fromAmount(99.99, 'USD').amount).toBe(99.99);
    });

    it('does not accumulate binary floating point error', () => {
      // The reason for the cents representation. Adding 0.1 and 0.2 as
      // JavaScript numbers gives 0.30000000000000004.
      const total = Money.fromAmount(0.1, 'USD').add(
        Money.fromAmount(0.2, 'USD'),
      );

      expect(total.amount).toBe(0.3);
    });

    it('rounds a third decimal', () => {
      expect(Money.fromAmount(1.006, 'USD').amount).toBe(1.01);
      expect(Money.fromAmount(1.004, 'USD').amount).toBe(1.0);
    });

    it('rounds an exact half-cent DOWN, which is worth knowing', () => {
      // Storing cents removes drift from arithmetic, not from the conversion
      // INTO cents: `1.005 * 100` is 100.49999999999999 in binary floating
      // point, so Math.round gives 100 rather than 101.
      //
      // Asserted rather than fixed. A correct half-cent rule needs decimal
      // parsing or an explicit rounding mode, and choosing one is a decision
      // about money that belongs to whoever is charging it -- not a detail to
      // change in passing. If a half cent matters to you, do not take
      // `fromAmount` on trust.
      expect(Money.fromAmount(1.005, 'USD').amount).toBe(1.0);
    });

    it('normalises the currency code to upper case', () => {
      expect(Money.fromAmount(10, 'usd').currency).toBe('USD');
    });

    it('defaults to USD', () => {
      expect(Money.fromAmount(10).currency).toBe('USD');
    });

    it('accepts zero and negative amounts', () => {
      // Money itself takes no view on sign -- a refund is negative money.
      // Whether a PRICE may be zero is the aggregate's business.
      expect(Money.fromAmount(0, 'USD').isZero()).toBe(true);
      expect(Money.fromAmount(-5, 'USD').isNegative()).toBe(true);
    });
  });

  describe('arithmetic', () => {
    const ten = () => Money.fromAmount(10, 'USD');

    it('adds and subtracts', () => {
      expect(ten().add(Money.fromAmount(2.5, 'USD')).amount).toBe(12.5);
      expect(ten().subtract(Money.fromAmount(2.5, 'USD')).amount).toBe(7.5);
    });

    it('multiplies and divides', () => {
      expect(ten().multiply(3).amount).toBe(30);
      expect(ten().divide(4).amount).toBe(2.5);
    });

    it('returns a new instance rather than mutating', () => {
      const original = ten();
      const sum = original.add(Money.fromAmount(5, 'USD'));

      expect(original.amount).toBe(10);
      expect(sum).not.toBe(original);
    });

    it('refuses to mix currencies', () => {
      // Silently adding EUR to USD would produce a number that means nothing.
      expect(() => ten().add(Money.fromAmount(5, 'EUR'))).toThrow(
        /Currency mismatch/,
      );
    });

    it('refuses to divide by zero', () => {
      // Deliberately a plain Error rather than a domain exception: no endpoint
      // can ask for this, so reaching it means a bug in the calling code and
      // it should surface as a 500 rather than a client error.
      expect(() => ten().divide(0)).toThrow('Cannot divide money by zero');
    });
  });

  describe('comparison', () => {
    it('orders two amounts', () => {
      const ten = Money.fromAmount(10, 'USD');
      const five = Money.fromAmount(5, 'USD');

      expect(ten.compareTo(five)).toBeGreaterThan(0);
      expect(five.compareTo(ten)).toBeLessThan(0);
      expect(ten.compareTo(Money.fromAmount(10, 'USD'))).toBe(0);
    });

    it('classifies sign', () => {
      expect(Money.fromAmount(1, 'USD').isPositive()).toBe(true);
      expect(Money.fromAmount(0, 'USD').isPositive()).toBe(false);
      expect(Money.fromAmount(0, 'USD').isZero()).toBe(true);
      expect(Money.fromAmount(-1, 'USD').isNegative()).toBe(true);
    });

    it('compares by value, not identity', () => {
      expect(
        Money.fromAmount(10, 'USD').equals(Money.fromAmount(10, 'USD')),
      ).toBe(true);
      expect(
        Money.fromAmount(10, 'USD').equals(Money.fromAmount(10, 'EUR')),
      ).toBe(false);
    });
  });

  describe('presentation', () => {
    it('formats with the currency symbol', () => {
      expect(Money.fromAmount(1999, 'USD').format()).toContain('1,999');
    });

    it('serialises to a plain amount and code', () => {
      expect(Money.fromAmount(49.99, 'USD').toJSON()).toEqual({
        amount: 49.99,
        currency: 'USD',
      });
    });
  });
});
