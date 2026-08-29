import {
  ArgumentNullException,
  InvalidFormatException,
} from '@nestjslatam/ddd-lib';

import { CustomerInfo } from './customer-info.vo';
import { ShippingAddress } from './shipping-address.vo';

/**
 * Both of these guard required values, and both raise the library's own
 * exceptions rather than plain Errors -- so `DomainExceptionFilter` answers
 * `400` naming the field instead of a bare `500`.
 */
describe('CustomerInfo', () => {
  const valid = () =>
    CustomerInfo.create('Ada Lovelace', 'ada@example.com', '+51999888777');

  it('holds what it was given', () => {
    const customer = valid();

    expect(customer.name).toBe('Ada Lovelace');
    expect(customer.email).toBe('ada@example.com');
    expect(customer.phone).toBe('+51999888777');
  });

  it.each([
    ['name', ['', 'ada@example.com', '+51999888777']],
    ['email', ['Ada', '', '+51999888777']],
    ['phone', ['Ada', 'ada@example.com', '']],
  ])('refuses a missing %s', (_field, args) => {
    const [name, email, phone] = args as [string, string, string];

    expect(() => CustomerInfo.create(name, email, phone)).toThrow(
      ArgumentNullException,
    );
  });

  it('refuses an address that is not an address', () => {
    // The one rule here that is more than presence. An email that is not an
    // email is a transport-level mistake, and the caller should hear about it
    // as a 400 rather than discovering it when the confirmation never arrives.
    expect(() =>
      CustomerInfo.create('Ada', 'not-an-email', '+51999888777'),
    ).toThrow(InvalidFormatException);
  });

  it('compares by value', () => {
    expect(valid().equals(valid())).toBe(true);
    expect(
      valid().equals(
        CustomerInfo.create(
          'Grace Hopper',
          'grace@example.com',
          '+51999888777',
        ),
      ),
    ).toBe(false);
  });
});

describe('ShippingAddress', () => {
  const valid = () =>
    ShippingAddress.create(
      '1 Main St',
      undefined,
      'Lima',
      'Lima',
      '15001',
      'PE',
    );

  it('holds what it was given, with an optional complement', () => {
    const address = valid();

    expect(address.street).toBe('1 Main St');
    expect(address.city).toBe('Lima');
    expect(address.country).toBe('PE');

    const withComplement = ShippingAddress.create(
      '1 Main St',
      'Flat 4',
      'Lima',
      'Lima',
      '15001',
      'PE',
    );
    expect(withComplement.complement).toBe('Flat 4');
  });

  it.each([
    ['street', ['', 'Lima', 'Lima', '15001', 'PE']],
    ['city', ['1 Main St', '', 'Lima', '15001', 'PE']],
    ['state', ['1 Main St', 'Lima', '', '15001', 'PE']],
    ['zip code', ['1 Main St', 'Lima', 'Lima', '', 'PE']],
    ['country', ['1 Main St', 'Lima', 'Lima', '15001', '']],
  ])('refuses a missing %s', (_field, args) => {
    const [street, city, state, zipCode, country] = args as string[];

    expect(() =>
      ShippingAddress.create(street, undefined, city, state, zipCode, country),
    ).toThrow(ArgumentNullException);
  });

  it('treats whitespace as absent', () => {
    // A field that is present but blank is not a field. Without this, a
    // shipping label would print an empty line and nobody would find out
    // until the parcel came back.
    expect(() =>
      ShippingAddress.create('   ', undefined, 'Lima', 'Lima', '15001', 'PE'),
    ).toThrow(ArgumentNullException);
  });

  it('compares by value', () => {
    expect(valid().equals(valid())).toBe(true);
  });
});
