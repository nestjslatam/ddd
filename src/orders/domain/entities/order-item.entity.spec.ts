import { IdValueObject } from '@nestjslatam/ddd-lib';

import { BrokenRulesException } from '../../../shared/exceptions/broken-rules.exception';
import { Money } from '../value-objects/money.vo';
import { OrderItem } from './order-item.entity';

/**
 * An entity inside an aggregate: it has identity, but only within the Order
 * that holds it. It is never saved or loaded on its own, which is why every
 * mutation here returns a NEW item rather than changing this one -- the Order
 * decides what its collection contains.
 */
describe('OrderItem', () => {
  const productId = () =>
    IdValueObject.load('f47ac10b-58cc-4372-a567-0e02b2c3d479');
  const price = (amount = 49.99) => Money.fromAmount(amount, 'USD');
  const item = (quantity = 2) =>
    OrderItem.create(productId(), 'Wireless Keyboard', quantity, price());

  describe('creation', () => {
    it('exposes what it was built from', () => {
      const line = item();

      expect(line.productName).toBe('Wireless Keyboard');
      expect(line.quantity).toBe(2);
      expect(line.unitPrice.amount).toBe(49.99);
    });

    it('computes the line total', () => {
      expect(item(3).totalPrice.amount).toBe(149.97);
    });

    it.each([
      ['zero', 0, 'Quantity must be at least 1'],
      ['negative', -1, 'Quantity must be at least 1'],
      ['fractional', 1.5, 'Quantity must be an integer'],
      ['above the cap', 10_001, 'Quantity cannot exceed 10000 per item'],
    ])('refuses a %s quantity', (_label, quantity, message) => {
      // These raise BrokenRulesException rather than a plain Error, so the
      // filter answers 422 naming the property instead of a bare 500. They are
      // reachable from a request body: the DTO says `quantity` is a number,
      // and only the entity says which numbers are meaningful.
      expect(() =>
        OrderItem.create(productId(), 'Keyboard', quantity, price()),
      ).toThrow(BrokenRulesException);

      expect(() =>
        OrderItem.create(productId(), 'Keyboard', quantity, price()),
      ).toThrow(message);
    });

    it('refuses an empty product name', () => {
      expect(() => OrderItem.create(productId(), '   ', 1, price())).toThrow(
        'Product name cannot be empty',
      );
    });

    it('refuses a product name beyond 500 characters', () => {
      expect(() =>
        OrderItem.create(productId(), 'x'.repeat(501), 1, price()),
      ).toThrow('Product name cannot exceed 500 characters');
    });

    it('names the property on the broken rule, not just the message', () => {
      try {
        OrderItem.create(productId(), 'Keyboard', 0, price());
        throw new Error('expected a rejection');
      } catch (error) {
        expect(error).toBeInstanceOf(BrokenRulesException);
        expect((error as BrokenRulesException).brokenRules[0].property).toBe(
          'quantity',
        );
      }
    });
  });

  describe('changing quantity', () => {
    it('returns a new item and leaves the original alone', () => {
      const original = item(2);
      const changed = original.withQuantity(5);

      expect(changed.quantity).toBe(5);
      expect(original.quantity).toBe(2);
      expect(changed).not.toBe(original);
    });

    it('recomputes the total', () => {
      expect(item(2).withQuantity(4).totalPrice.amount).toBe(199.96);
    });

    it('applies the same rules as creation', () => {
      expect(() => item(2).withQuantity(0)).toThrow(
        'Quantity must be at least 1',
      );
    });

    it('increases by a positive increment', () => {
      expect(item(2).withIncreasedQuantity(3).quantity).toBe(5);
    });

    it('refuses a non-positive increment', () => {
      // Decreasing is withQuantity's job. An "increase" of -1 is a caller
      // mistake, not a quiet decrement.
      expect(() => item(2).withIncreasedQuantity(0)).toThrow(
        'Increment must be positive',
      );
      expect(() => item(2).withIncreasedQuantity(-1)).toThrow(
        'Increment must be positive',
      );
    });
  });

  describe('identity', () => {
    it('recognises the product it is for', () => {
      expect(item().isForProduct(productId())).toBe(true);
      expect(
        item().isForProduct(
          IdValueObject.load('00000000-0000-4000-8000-000000000000'),
        ),
      ).toBe(false);
    });

    it('serialises to a plain object', () => {
      const plain = item().toPlainObject();

      expect(plain).toEqual(
        expect.objectContaining({
          productName: 'Wireless Keyboard',
          quantity: 2,
        }),
      );
    });
  });
});
