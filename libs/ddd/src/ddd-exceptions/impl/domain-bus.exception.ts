import {
  DOMAIN_EVENT_BUS_EXCEPTION,
  DOMAIN_EVENT_EXCEPTION,
} from '../constants';
import { DomainExceptionBase } from '../interfaces/exception.base';

/**
 * Exception class representing a domain event.
 */
export class DomainEventException extends DomainExceptionBase {
  readonly code = DOMAIN_EVENT_EXCEPTION;
}

/**
 * Exception class representing a domain event bus.
 */
export class DomainEventBusException extends DomainExceptionBase {
  readonly code = DOMAIN_EVENT_BUS_EXCEPTION;
}
