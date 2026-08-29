import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ArgumentNullException,
  DomainException,
  InvalidFormatException,
  InvalidOperationException,
  InvalidStateTransitionException,
} from '@nestjslatam/ddd-lib';

import { BrokenRulesException } from '../exceptions/broken-rules.exception';

/**
 * Translates domain failures into the status code they deserve.
 *
 * Without this, a rejected `price: 0` came back as `500 Internal server
 * error` with no body — the same answer the caller would get if the process
 * had run out of memory. A broken invariant is the caller's mistake, and the
 * response should say so and say which rule.
 *
 * The mapping:
 *
 *   BrokenRulesException            422  the request was well-formed but the
 *                                        domain refused it, with the rules
 *   ArgumentNullException           400  a required value was absent
 *   InvalidFormatException          400  a value was the wrong shape, e.g. an
 *                                        id that is not a UUID
 *   InvalidStateTransitionException 409  the aggregate is in a state that
 *                                        does not allow this
 *   InvalidOperationException       409  the operation is not legal now
 *
 * Anything that is not a domain exception is deliberately left alone: an
 * unexpected error IS a 500, and dressing it up as a client error would hide
 * a real fault.
 */
@Catch(DomainException, BrokenRulesException)
export class DomainExceptionFilter implements ExceptionFilter {
  private static readonly REASON: Record<number, string> = {
    [HttpStatus.BAD_REQUEST]: 'Bad Request',
    [HttpStatus.CONFLICT]: 'Conflict',
    [HttpStatus.UNPROCESSABLE_ENTITY]: 'Unprocessable Entity',
  };

  private readonly logger = new Logger(DomainExceptionFilter.name);

  catch(
    exception: DomainException | BrokenRulesException,
    host: ArgumentsHost,
  ) {
    const response = host.switchToHttp().getResponse<Response>();
    const { status, body } = this.describe(exception);

    // Logged at warn, not error: the domain working as designed is not a
    // fault, and treating it as one trains people to ignore the error log.
    this.logger.warn(`${status} ${exception.name}: ${exception.message}`);

    response.status(status).json(body);
  }

  private describe(exception: DomainException | BrokenRulesException): {
    status: number;
    body: Record<string, unknown>;
  } {
    if (exception instanceof BrokenRulesException) {
      return {
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        body: {
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          error: 'Unprocessable Entity',
          message: `${exception.subject} is invalid`,
          brokenRules: exception.brokenRules.map((rule) => ({
            property: rule.property,
            message: rule.message,
            severity: rule.severity,
          })),
        },
      };
    }

    const status =
      exception instanceof ArgumentNullException ||
      exception instanceof InvalidFormatException
        ? HttpStatus.BAD_REQUEST
        : exception instanceof InvalidStateTransitionException ||
            exception instanceof InvalidOperationException
          ? HttpStatus.CONFLICT
          : HttpStatus.UNPROCESSABLE_ENTITY;

    return {
      status,
      body: {
        statusCode: status,
        error: DomainExceptionFilter.REASON[status] ?? 'Unprocessable Entity',
        message: exception.message,
      },
    };
  }
}
