import { IDomainEvent } from './../../ddd-events';
import { IDomainCommand } from './../../ddd-commands';

export interface UnhandledExceptionInfo<
  Cause = IDomainEvent | IDomainCommand,
  Exception = any,
> {
  exception: Exception;
  cause: Cause;
}
