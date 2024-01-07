import { IDomainEvent } from './../../ddd-events';
import { IDomainCommand } from './../../ddd-commands';
import { UnhandledExceptionInfo } from './unhandled-exception-info.interface';

/**
 * Unhandled Exception Publisher
 *
 * @export
 * @interface IUnhandledExceptionPublisher
 * @template CauseBase
 * @template ExceptionBase
 */
export interface IUnhandledExceptionPublisher<
  CauseBase = IDomainEvent | IDomainCommand,
  ExceptionBase = any,
> {
  publish(info: UnhandledExceptionInfo<CauseBase, ExceptionBase>): any;
}
