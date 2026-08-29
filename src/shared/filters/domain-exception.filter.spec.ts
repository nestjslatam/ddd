import { ArgumentsHost, HttpStatus } from '@nestjs/common';
import {
  ArgumentNullException,
  BrokenRule,
  InvalidFormatException,
  InvalidOperationException,
  InvalidStateTransitionException,
} from '@nestjslatam/ddd-lib';

import { BrokenRulesException } from '../exceptions/broken-rules.exception';
import { DomainExceptionFilter } from './domain-exception.filter';

/**
 * The mapping in one place, so a change to it is deliberate.
 *
 * Before this filter existed, a rejected `price: 0` came back as
 * `500 Internal server error` with no body -- the same answer the caller would
 * get if the process had run out of memory. The distinction it draws is the
 * one worth teaching: a wrong TYPE is structure and never reaches the domain;
 * a wrong VALUE is meaning, and only the aggregate can judge it.
 */
describe('DomainExceptionFilter', () => {
  const captured: { status?: number; body?: Record<string, unknown> } = {};

  const host = () =>
    ({
      switchToHttp: () => ({
        getResponse: () => ({
          status(code: number) {
            captured.status = code;
            return this;
          },
          json(body: Record<string, unknown>) {
            captured.body = body;
            return this;
          },
        }),
      }),
    }) as unknown as ArgumentsHost;

  const filter = new DomainExceptionFilter();

  beforeEach(() => {
    delete captured.status;
    delete captured.body;
  });

  it('answers 422 and lists the broken rules', () => {
    filter.catch(
      new BrokenRulesException('Price', [
        new BrokenRule('value', 'Price must be greater than zero', 'Error'),
      ]),
      host(),
    );

    expect(captured.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(captured.body).toEqual({
      statusCode: 422,
      error: 'Unprocessable Entity',
      message: 'Price is invalid',
      brokenRules: [
        {
          property: 'value',
          message: 'Price must be greater than zero',
          severity: 'Error',
        },
      ],
    });
  });

  it('carries every rule, not just the first', () => {
    // The rules are the point of the 422. Flattening them into a message
    // string -- which the handlers used to do -- makes them unrecoverable by
    // the time they reach the transport.
    filter.catch(
      new BrokenRulesException('Order', [
        new BrokenRule('items', 'Order must have at least one item', 'Error'),
        new BrokenRule(
          'totalAmount',
          'Order amount must be at least $10',
          'Error',
        ),
      ]),
      host(),
    );

    expect(captured.body?.brokenRules).toHaveLength(2);
  });

  it.each([
    [
      'a missing value',
      new ArgumentNullException('street'),
      400,
      'Bad Request',
    ],
    [
      'a wrong shape',
      new InvalidFormatException('id', 'a valid UUID'),
      400,
      'Bad Request',
    ],
    [
      'an illegal transition',
      new InvalidStateTransitionException('DRAFT', 'SHIPPED'),
      409,
      'Conflict',
    ],
    [
      'an operation the state forbids',
      new InvalidOperationException('Cannot confirm order without items'),
      409,
      'Conflict',
    ],
  ])('answers %s with %i', (_label, exception, status, reason) => {
    filter.catch(exception as never, host());

    expect(captured.status).toBe(status);
    expect(captured.body).toEqual(
      expect.objectContaining({ statusCode: status, error: reason }),
    );
  });

  it('puts the exception message in the body for the non-rule cases', () => {
    filter.catch(new ArgumentNullException('reason'), host());

    expect(String(captured.body?.message)).toContain('reason');
  });
});
