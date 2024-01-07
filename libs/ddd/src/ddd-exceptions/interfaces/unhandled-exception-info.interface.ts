import { IDomainEvent } from './../../ddd-events';
import { IDomainCommand } from './../../ddd-commands';

/**
 * Unhandled Exception Info
 *
 * @export
 * @interface UnhandledExceptionInfo
 * @template Cause
 * @template Exception
 */
export interface UnhandledExceptionInfo<
  Cause = IDomainEvent | IDomainCommand,
  Exception = any,
> {
  exception: Exception;
  cause: Cause;
}
