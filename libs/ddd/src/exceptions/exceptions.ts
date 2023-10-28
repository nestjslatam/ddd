import {
  DOMAIN_ARGUMENT_INVALID,
  DOMAIN_ARGUMENT_NOT_PROVIDED,
  DOMAIN_ARGUMENT_OUT_OF_RANGE,
  DOMAIN_CONFLICT,
  DOMAIN_INTERNAL_SERVER_ERROR,
  DOMAIN_NOT_FOUND,
} from './constants';

import { DomainExceptionBase } from './exception.base';

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
export class DomainConflictException extends DomainExceptionBase {
  readonly code = DOMAIN_CONFLICT;
}

export class DomainCommandHandlerNotFoundException extends DomainExceptionBase {
  readonly code = 'DomainCommandHandler';
}

export class DomainInvalidCommandHandlerException extends DomainExceptionBase {
  readonly code = 'DomainInvalidCommandHandler';
}

export class DomainInvalidSagaException extends DomainExceptionBase {
  readonly code = 'DomainInvalidSaga';
}

/**
 * Used to indicate that entity is not found
 */
export class DomainNotFoundException extends DomainExceptionBase {
  static readonly message = 'Not found';

  constructor(message = DomainNotFoundException.message) {
    super(message);
  }

  readonly code = DOMAIN_NOT_FOUND;
}

/**
 * Used to indicate an internal server error that does not fall under all other errors
 */
export class DomainInternalServerErrorException extends DomainExceptionBase {
  static readonly message = 'Internal server error';

  constructor(message = DomainInternalServerErrorException.message) {
    super(message);
  }

  readonly code = DOMAIN_INTERNAL_SERVER_ERROR;
}
