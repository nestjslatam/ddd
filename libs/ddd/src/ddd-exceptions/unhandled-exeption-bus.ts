import 'reflect-metadata';
import { Injectable, Type } from '@nestjs/common';
import { Observable, filter } from 'rxjs';

import { IDomainEvent } from '../ddd-events';
import {
  IUnhandledExceptionPublisher,
  UnhandledExceptionInfo,
} from './interfaces';
import { DefaultUnhandledExceptionPubSub } from './default-unhandled-exception-pubsub.helper';
import { IDomainCommand } from '../ddd-commands';
import { ObservableBus } from '../ddd-core';

/**
 * A bus that publishes unhandled exceptions.
 * @template Cause The type of the cause of the exception.
 */
@Injectable()
export class UnhandledExceptionBus<
  Cause = IDomainEvent | IDomainCommand,
> extends ObservableBus<UnhandledExceptionInfo<Cause>> {
  private _publisher: IUnhandledExceptionPublisher<Cause>;

  constructor() {
    super();
    this.useDefaultPublisher();
  }

  /**
   * Filter values depending on their instance type (comparison is made
   * using native `instanceof`).
   *
   * @param types List of types to filter by.
   * @return A stream only emitting the filtered exceptions.
   */
  static ofType<TInput, TOutput>(...types: Type<TOutput>[]) {
    const isInstanceOf = (
      exceptionInfo: UnhandledExceptionInfo,
    ): exceptionInfo is UnhandledExceptionInfo<TOutput> =>
      !!types.find((classType) => exceptionInfo.exception instanceof classType);

    return (
      source: Observable<UnhandledExceptionInfo<TInput>>,
    ): Observable<UnhandledExceptionInfo<TOutput>> =>
      source.pipe(filter(isInstanceOf));
  }

  /**
   * Gets the publisher of the bus.
   */
  get publisher(): IUnhandledExceptionPublisher<Cause> {
    return this._publisher;
  }

  /**
   * Sets the publisher of the bus.
   */
  set publisher(_publisher: IUnhandledExceptionPublisher<Cause>) {
    this._publisher = _publisher;
  }

  /**
   * Publishes an unhandled exception.
   * @param info The exception information.
   */
  publish(info: UnhandledExceptionInfo<Cause>) {
    return this._publisher.publish(info);
  }

  private useDefaultPublisher() {
    this._publisher = new DefaultUnhandledExceptionPubSub<Cause>(this.subject$);
  }
}
