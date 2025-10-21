import {
  DOMAIN_ARGUMENT_INVALID,
  DOMAIN_ARGUMENT_NOT_PROVIDED,
  DOMAIN_ARGUMENT_OUT_OF_RANGE,
} from '../constants';
import { DomainExceptionBase } from '../interfaces/exception.base';

/**
 * Used to indicate that an incorrect argument was provided to a method/function/class constructor
 */

export class DomainArgumentInvalidException extends DomainExceptionBase {
  readonly code = DOMAIN_ARGUMENT_INVALID;
}
/**
 * Used to indicate that an argument was not provided (is empty object/array, null of undefined).
 */

export class DomainArgumentNotProvidedException extends DomainExceptionBase {
  readonly code = DOMAIN_ARGUMENT_NOT_PROVIDED;
}
/**
 * Used to indicate that an argument is out of allowed range
 * (for example: incorrect string/array length, number not in allowed min/max range etc)
 */

export class DomainArgumentOutOfRangeException extends DomainExceptionBase {
  readonly code = DOMAIN_ARGUMENT_OUT_OF_RANGE;
}
/**
 * Used to indicate conflicting entities (usually in the database)
 */
