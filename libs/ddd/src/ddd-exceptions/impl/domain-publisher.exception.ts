import { Subject } from 'rxjs';
import { IDomainEvent } from '../../ddd-events';

import { IUnhandledExceptionPublisher, UnhandledExceptionInfo } from '..';
import { IDomainCommand } from '../../ddd-commands';

/**
 * Represents a default implementation of the unhandled exception publisher.
 * This publisher is responsible for publishing unhandled exception information to a subject.
 *
 * @template Cause - The type of the cause of the unhandled exception (either IDomainEvent or IDomainCommand).
 */
export class DefaultUnhandledExceptionPublisher<
  Cause = IDomainEvent | IDomainCommand,
> implements IUnhandledExceptionPublisher<Cause>
{
  /**
   * Creates an instance of DefaultUnhandledExceptionPublisher.
   *
   * @param subject$ - The subject to which the unhandled exception information will be published.
   */
  constructor(private subject$: Subject<UnhandledExceptionInfo<Cause>>) {}

  /**
   * Publishes the unhandled exception information to the subject.
   *
   * @param info - The unhandled exception information to be published.
   */
  publish(info: UnhandledExceptionInfo<Cause>) {
    this.subject$.next(info);
  }
}
