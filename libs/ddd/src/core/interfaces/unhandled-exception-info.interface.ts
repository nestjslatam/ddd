import { IDomainCommand, IDomainEvent } from '.';

export interface UnhandledExceptionInfo<
  Cause = IDomainEvent | IDomainCommand,
  Exception = any,
> {
  exception: Exception;
  cause: Cause;
}
