import {
  DOMAIN_COMMAND_HANDLER_NOT_FOUND,
  DOMAIN_INVALID_COMMAND_HANDLER,
} from '../constants';

import { DomainExceptionBase } from '../interfaces/exception.base';

/**
 * Exception class representing a domain command handler not found.
 */
export class DomainCommandHandlerNotFoundException extends DomainExceptionBase {
  readonly code = DOMAIN_COMMAND_HANDLER_NOT_FOUND;
}

/**
 * Exception class representing an invalid domain command handler.
 */
export class DomainInvalidCommandHandlerException extends DomainExceptionBase {
  readonly code = DOMAIN_INVALID_COMMAND_HANDLER;
}
