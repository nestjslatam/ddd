import { DOMAIN_INVALID_SAGA } from '../constants';

import { DomainExceptionBase } from '../interfaces/exception.base';

/**
 * Exception class representing an invalid domain saga.
 */
export class DomainInvalidSagaException extends DomainExceptionBase {
  readonly code = DOMAIN_INVALID_SAGA;
}
