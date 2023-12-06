import { Subject } from 'rxjs';
import { IDomainEvent } from '../ddd-events';

import {
  IUnhandledExceptionPublisher,
  UnhandledExceptionInfo,
} from '../ddd-exceptions';
import { IDomainCommand } from '../ddd-commands';

export class DefaultUnhandledExceptionPubSub<
  Cause = IDomainEvent | IDomainCommand,
> implements IUnhandledExceptionPublisher<Cause>
{
  constructor(private subject$: Subject<UnhandledExceptionInfo<Cause>>) {}

  publish(info: UnhandledExceptionInfo<Cause>) {
    this.subject$.next(info);
  }
}
