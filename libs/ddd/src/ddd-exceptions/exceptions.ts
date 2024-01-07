import {
  DOMAIN_ARGUMENT_INVALID,
  DOMAIN_ARGUMENT_NOT_PROVIDED,
  DOMAIN_ARGUMENT_OUT_OF_RANGE,
  DOMAIN_COMMAND_HANDLER_NOT_FOUND,
  DOMAIN_CONFLICT,
  DOMAIN_CRITERIA,
  DOMAIN_EVENT_BUS_EXCEPTION,
  DOMAIN_EVENT_EXCEPTION,
  DOMAIN_INTERNAL_SERVER_ERROR,
  DOMAIN_INVALID_COMMAND_HANDLER,
  DOMAIN_INVALID_SAGA,
  DOMAIN_NOT_FOUND,
  INTERNAL_SERVER_ERROR,
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

export class DomainEventException extends DomainExceptionBase {
  readonly code = DOMAIN_EVENT_EXCEPTION;
}

export class DomainEventBusException extends DomainExceptionBase {
  readonly code = DOMAIN_EVENT_BUS_EXCEPTION;
}

export class DomainCommandHandlerNotFoundException extends DomainExceptionBase {
  readonly code = DOMAIN_COMMAND_HANDLER_NOT_FOUND;
}

export class DomainInvalidCommandHandlerException extends DomainExceptionBase {
  readonly code = DOMAIN_INVALID_COMMAND_HANDLER;
}

export class DomainInvalidSagaException extends DomainExceptionBase {
  readonly code = DOMAIN_INVALID_SAGA;
}

export class DomainCriteriaException extends DomainExceptionBase {
  readonly code = DOMAIN_CRITERIA;
}

/**
 * Used to indicate that entity is not found
 */
export class DomainNotFoundException extends DomainExceptionBase {
  static readonly message = DOMAIN_NOT_FOUND;

  constructor(message = DomainNotFoundException.message) {
    super(message);
  }

  readonly code = DOMAIN_NOT_FOUND;
}

/**
 * Used to indicate an internal server error that does not fall under all other errors
 */
export class DomainInternalServerErrorException extends DomainExceptionBase {
  static readonly message = INTERNAL_SERVER_ERROR;

  constructor(message = DomainInternalServerErrorException.message) {
    super(message);
  }

  readonly code = DOMAIN_INTERNAL_SERVER_ERROR;
}
