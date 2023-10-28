import { IDomainEvent } from '@nestjslatam/ddd';

import { ICommand } from '.';
import { UnhandledExceptionInfo } from './unhandled-exception-info.interface';

export interface IUnhandledExceptionPublisher<
  CauseBase = IDomainEvent | ICommand,
  ExceptionBase = any,
> {
  publish(info: UnhandledExceptionInfo<CauseBase, ExceptionBase>): any;
}
