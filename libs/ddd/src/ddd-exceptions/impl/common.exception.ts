import {
  DOMAIN_CONFLICT,
  DOMAIN_INTERNAL_SERVER_ERROR,
  DOMAIN_NOT_FOUND,
  INTERNAL_SERVER_ERROR,
} from '../constants';

import { DomainExceptionBase } from '../interfaces/exception.base';

/**
 * Used to indicate conflicting entities (usually in the database)
 */
export class DomainConflictException extends DomainExceptionBase {
  readonly code = DOMAIN_CONFLICT;
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
