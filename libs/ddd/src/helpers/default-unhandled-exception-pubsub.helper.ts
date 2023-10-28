import { Subject } from 'rxjs';
import {
  ICommand,
  IUnhandledExceptionPublisher,
  UnhandledExceptionInfo,
} from '../core/interfaces';
import { IDomainEvent } from '@nestjslatam/ddd';

export class DefaultUnhandledExceptionPubSub<Cause = IDomainEvent | ICommand>
  implements IUnhandledExceptionPublisher<Cause>
{
  constructor(private subject$: Subject<UnhandledExceptionInfo<Cause>>) {}

  publish(info: UnhandledExceptionInfo<Cause>) {
    this.subject$.next(info);
  }
}
