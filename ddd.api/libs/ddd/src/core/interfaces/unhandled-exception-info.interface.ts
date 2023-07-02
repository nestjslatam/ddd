import { ICommand } from './command.interface';
import { IDomainEvent } from './domain-event.interface';

export interface UnhandledExceptionInfo<
  Cause = IDomainEvent | ICommand,
  Exception = any,
> {
  exception: Exception;
  cause: Cause;
}
