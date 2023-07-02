import { ICommand } from './command.interface';
import { IDomainEvent } from './domain-event.interface';
import { UnhandledExceptionInfo } from './unhandled-exception-info.interface';

export interface IUnhandledExceptionPublisher<
  CauseBase = IDomainEvent | ICommand,
  ExceptionBase = any,
> {
  publish(info: UnhandledExceptionInfo<CauseBase, ExceptionBase>): any;
}
