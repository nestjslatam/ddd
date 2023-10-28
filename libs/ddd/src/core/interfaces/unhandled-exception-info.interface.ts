import { ICommand, IDomainEvent } from '.';

export interface UnhandledExceptionInfo<
  Cause = IDomainEvent | ICommand,
  Exception = any,
> {
  exception: Exception;
  cause: Cause;
}
