import { Subject } from 'rxjs';
import {
  IDomainCommand,
  IDomainEvent,
  IUnhandledExceptionPublisher,
  UnhandledExceptionInfo,
} from '../core/interfaces';

export class DefaultUnhandledExceptionPubSub<
  Cause = IDomainEvent | IDomainCommand,
> implements IUnhandledExceptionPublisher<Cause>
{
  constructor(private subject$: Subject<UnhandledExceptionInfo<Cause>>) {}

  publish(info: UnhandledExceptionInfo<Cause>) {
    this.subject$.next(info);
  }
}
