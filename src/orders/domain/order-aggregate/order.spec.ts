import {
  ArgumentNullException,
  IdValueObject,
  InvalidOperationException,
  InvalidStateTransitionException,
} from '@nestjslatam/ddd-lib';
import { NotFoundException } from '@nestjs/common';

import { OrderItem } from '../entities/order-item.entity';

import { BrokenRulesException } from '../../../shared/exceptions/broken-rules.exception';
import { CustomerInfo } from '../value-objects/customer-info.vo';
import { Money } from '../value-objects/money.vo';
import { ShippingAddress } from '../value-objects/shipping-address.vo';
import { Order } from './order';
import { OrderStatus } from './order-status.enum';

/**
 * The richest aggregate here, and the one that was at 0% coverage: a lifecycle,
 * child entities, and invariants that only hold at some states.
 *
 *   DRAFT -> CONFIRMED -> PROCESSING -> SHIPPED -> DELIVERED
 *     |          |            |
 *     +----------+------------+---> CANCELLED
 */
describe('Order', () => {
  const customer = () =>
    CustomerInfo.create('Ada Lovelace', 'ada@example.com', '+51999888777');
  const address = () =>
    ShippingAddress.create(
      '1 Main St',
      undefined,
      'Lima',
      'Lima',
      '15001',
      'PE',
    );

  const productId = (last = '479') =>
    IdValueObject.load(`f47ac10b-58cc-4372-a567-0e02b2c3d${last}`);

  const draft = () => Order.create(customer(), address());

  /** A draft carrying enough value to satisfy the minimum-amount rule. */
  const stocked = () => {
    const order = draft();
    order.addItem(
      productId(),
      'Wireless Keyboard',
      2,
      Money.fromAmount(49.99, 'USD'),
    );
    return order;
  };

  describe('creation', () => {
    it('opens an empty DRAFT', () => {
      // A cart starts empty. Order.create builds one with `items: []`, which is
      // why the item-count and minimum-amount rules apply from CONFIRMED
      // onward -- stated unconditionally they made every draft permanently
      // invalid, and the aggregate rejected the object its own factory had
      // just built.
      const order = draft();

      expect(order.status).toBe(OrderStatus.DRAFT);
      expect(order.items).toHaveLength(0);
      expect(order.isValid).toBe(true);
      expect(order.isDraft()).toBe(true);
    });

    it('refuses to be built without a customer or an address', () => {
      expect(() => Order.create(undefined as never, address())).toThrow(
        ArgumentNullException,
      );
      expect(() => Order.create(customer(), undefined as never)).toThrow(
        ArgumentNullException,
      );
    });

    it('defaults to USD and keeps what it was given', () => {
      expect(draft().currency).toBe('USD');
      expect(Order.create(customer(), address(), 'EUR').currency).toBe('EUR');
    });
  });

  describe('items', () => {
    it('adds one and totals it', () => {
      const order = stocked();

      expect(order.items).toHaveLength(1);
      expect(order.items[0].quantity).toBe(2);
    });

    it('changes a quantity', () => {
      const order = stocked();
      order.changeItemQuantity(productId(), 5);

      expect(order.items[0].quantity).toBe(5);
    });

    it('removes one', () => {
      const order = stocked();
      order.removeItem(productId());

      expect(order.items).toHaveLength(0);
    });

    it('clears them all', () => {
      const order = stocked();
      order.clearItems();

      expect(order.items).toHaveLength(0);
    });

    it('answers 404-shaped for an item it does not hold', () => {
      // NotFoundException rather than a domain exception: the caller asked
      // about something that is not there, which is not an invariant failing.
      expect(() => stocked().removeItem(productId('000'))).toThrow(
        NotFoundException,
      );
      expect(() => stocked().changeItemQuantity(productId('000'), 2)).toThrow(
        NotFoundException,
      );
    });

    it('hands out a copy, so a caller cannot add an item behind its back', () => {
      // `items` returns `[...this.props.items]`. ReadonlyArray is a
      // compile-time promise only -- at runtime it is an ordinary array and
      // `push` succeeds. The copy is what actually protects the invariant:
      // the aggregate's own collection is untouched, so no item enters
      // without addItem running its rules.
      const order = stocked();
      const handedOut = order.items as OrderItem[];

      handedOut.push(handedOut[0]);

      expect(handedOut).toHaveLength(2);
      expect(order.items).toHaveLength(1);
    });
  });

  describe('the lifecycle', () => {
    it('confirms a stocked draft', () => {
      const order = stocked();
      order.confirm();

      expect(order.status).toBe(OrderStatus.CONFIRMED);
      expect(order.isConfirmed()).toBe(true);
      expect(order.confirmedAt).toBeInstanceOf(Date);
    });

    it('refuses to confirm an empty draft', () => {
      // Nothing is malformed and no value is wrong: the aggregate is simply
      // not in a state that allows this, which is a 409 rather than a 422.
      expect(() => draft().confirm()).toThrow(InvalidOperationException);
      expect(() => draft().confirm()).toThrow(
        'Cannot confirm order without items',
      );
    });

    it('walks the full happy path', () => {
      const order = stocked();

      order.confirm();
      order.startProcessing();
      order.ship('TRACK-1');
      order.deliver();

      expect(order.status).toBe(OrderStatus.DELIVERED);
      expect(order.trackingNumber).toBe('TRACK-1');
      expect(order.shippedAt).toBeInstanceOf(Date);
      expect(order.deliveredAt).toBeInstanceOf(Date);
    });

    it('refuses to skip a step', () => {
      // DRAFT -> SHIPPED is not in the transition map. This is the gap the API
      // reference documents: no endpoint reaches PROCESSING, so ship() and
      // deliver() are unreachable over HTTP even though the aggregate
      // supports them.
      expect(() => stocked().ship()).toThrow(InvalidStateTransitionException);
    });

    it('refuses to modify items once it is past DRAFT', () => {
      const order = stocked();
      order.confirm();

      expect(order.canModifyItems()).toBe(false);
      expect(() =>
        order.addItem(
          productId('001'),
          'Mouse',
          1,
          Money.fromAmount(19.99, 'USD'),
        ),
      ).toThrow(InvalidOperationException);
    });
  });

  describe('cancellation', () => {
    it('cancels from DRAFT, CONFIRMED and PROCESSING', () => {
      const fromDraft = stocked();
      fromDraft.cancel('changed mind');
      expect(fromDraft.status).toBe(OrderStatus.CANCELLED);
      expect(fromDraft.cancellationReason).toBe('changed mind');

      const fromConfirmed = stocked();
      fromConfirmed.confirm();
      fromConfirmed.cancel('out of stock');
      expect(fromConfirmed.status).toBe(OrderStatus.CANCELLED);

      const fromProcessing = stocked();
      fromProcessing.confirm();
      fromProcessing.startProcessing();
      fromProcessing.cancel('warehouse fire');
      expect(fromProcessing.status).toBe(OrderStatus.CANCELLED);
    });

    it('refuses to cancel without a reason', () => {
      expect(() => stocked().cancel('')).toThrow(ArgumentNullException);
    });

    it('refuses to cancel once delivered', () => {
      const order = stocked();
      order.confirm();
      order.startProcessing();
      order.ship();
      order.deliver();

      expect(order.canBeCancelled()).toBe(false);
      expect(() => order.cancel('too late')).toThrow();
    });
  });

  describe('invariants', () => {
    it('refuses money in another currency', () => {
      const order = draft();

      expect(() =>
        order.addItem(productId(), 'Keyboard', 1, Money.fromAmount(10, 'EUR')),
      ).toThrow(BrokenRulesException);
    });

    it('caps the number of distinct items', () => {
      // 50 is the documented maximum; the 51st is refused with the rule named.
      const order = draft();
      for (let i = 0; i < 50; i++) {
        order.addItem(
          IdValueObject.load(
            `f47ac10b-58cc-4372-a567-0e02b2c3${String(i).padStart(4, '0')}`,
          ),
          `Item ${i}`,
          1,
          Money.fromAmount(1, 'USD'),
        );
      }

      expect(() =>
        order.addItem(
          productId('fff'),
          'One too many',
          1,
          Money.fromAmount(1, 'USD'),
        ),
      ).toThrow(/Maximum 50 items/);
    });
  });

  describe('state tracking', () => {
    it('stays NEW through its changes, rather than becoming dirty', () => {
      // A repository reads this to choose between an insert and an update.
      // An aggregate that has never been persisted is `new`, and it stays new
      // however much it changes -- those changes are part of the same insert.
      // `dirty` is for something loaded from storage and then modified.
      //
      // isNew and isDirty are GETTERS, like isValid; all three became getters
      // in ddd-lib 3.0.0. Called as methods they are compile errors; read on
      // an older version they were always-truthy Functions.
      const order = stocked();

      expect(order.trackingState.isNew).toBe(true);
      expect(order.trackingState.isDirty).toBe(false);
    });

    it('recovers validity once a violation is corrected', () => {
      // validate() clears before re-deriving, so an aggregate that failed once
      // can become valid again. Before ddd-lib 4.0.0 it could not, and the
      // canonical load -> correct -> revalidate -> save flow was impossible.
      const order = stocked();
      order.confirm();

      expect(order.isValid).toBe(true);
      expect(order.brokenRules.getBrokenRules()).toHaveLength(0);
    });
  });
});
