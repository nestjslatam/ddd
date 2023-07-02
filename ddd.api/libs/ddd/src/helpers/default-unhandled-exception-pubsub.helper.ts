import { Subject } from 'rxjs';
import {
  ICommand,
  IDomainEvent,
  IUnhandledExceptionPublisher,
  UnhandledExceptionInfo,
} from '../core/interfaces';

export class DefaultUnhandledExceptionPubSub<Cause = IDomainEvent | ICommand>
  implements IUnhandledExceptionPublisher<Cause>
{
  constructor(private subject$: Subject<UnhandledExceptionInfo<Cause>>) {}

  publish(info: UnhandledExceptionInfo<Cause>) {
    this.subject$.next(info);
  }
}
