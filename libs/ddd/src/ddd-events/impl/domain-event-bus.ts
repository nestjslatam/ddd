import { OnModuleDestroy, Injectable, Logger, Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import {
  Observable,
  Subscription,
  catchError,
  defer,
  filter,
  mergeMap,
  throwError,
} from 'rxjs';

import { ISaga, ObservableBus } from './../../ddd-core';
import { DomainCommandBus, IDomainCommand } from '../../ddd-commands';

import {
  IDomainEvent,
  IDomainEventBus,
  IDomainEventHandler,
  IDomainEventPublisher,
} from '../interfaces';

import {
  DomainEventBusException,
  DomainInvalidSagaException,
  UnhandledExceptionBus,
  UnhandledExceptionInfo,
} from '../../ddd-exceptions/';
import { DOMAIN_SAGA_METADATA, ReflectEventHelper } from '../../ddd-decorators';
import { DefaultDomainEventPublisher } from './default-event-publisher';
import { DomainEventHandlerType } from './domain-event-types';

@Injectable()
export class DomainEventBus<DomainEventBase extends IDomainEvent = IDomainEvent>
  extends ObservableBus<DomainEventBase>
  implements IDomainEventBus<DomainEventBase>, OnModuleDestroy
{
  /**
   * A function that retrieves the ID of a domain event.
   * By default, it uses the `ReflectEventHelper.getDomainEventId` function.
   */
  protected getDomainEventId: (domainEvent: DomainEventBase) => string | null;

  /**
   * An array of subscriptions to the domain event stream.
   */
  protected readonly _subscriptions: Subscription[];

  /**
   * The publisher responsible for publishing domain events.
   */
  private _publisher: IDomainEventPublisher<DomainEventBase>;

  /**
   * The logger instance for logging messages related to the `DomainEventBus` class.
   */
  private readonly _logger = new Logger(DomainEventBus.name);

  /**
   * Creates an instance of `DomainEventBus`.
   *
   * @param commandBus - The domain command bus used for executing domain commands.
   * @param moduleRef - The module reference used for dependency injection.
   * @param unhandledExceptionBus - The bus used for publishing unhandled exceptions.
   */
  constructor(
    private readonly commandBus: DomainCommandBus,
    private readonly moduleRef: ModuleRef,
    private readonly unhandledExceptionBus: UnhandledExceptionBus,
  ) {
    super();

    this._subscriptions = [];
    this.getDomainEventId = ReflectEventHelper.getDomainEventId;
    this.useDefaultPublisher();
  }

  /**
   * Gets the current domain event publisher.
   */
  get publisher(): IDomainEventPublisher<DomainEventBase> {
    return this._publisher;
  }

  /**
   * Sets the domain event publisher.
   *
   * @param value - The domain event publisher to set.
   * @throws `DomainEventBusException` if the provided publisher is null.
   */
  set publisher(value: IDomainEventPublisher<DomainEventBase>) {
    if (!value) {
      throw new DomainEventBusException('Publisher cannot be null');
    }

    this._publisher = value;
  }

  /**
   * Lifecycle hook that is called when the module is being destroyed.
   * It unsubscribes from all event subscriptions.
   */
  onModuleDestroy() {
    this._subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  /**
   * Publishes a domain event.
   *
   * @param domainEvent - The domain event to publish.
   * @returns A promise that resolves when the event is published.
   */
  publish<T extends DomainEventBase>(domainEvent: T) {
    return this._publisher.publish(domainEvent);
  }

  /**
   * Publishes multiple domain events.
   *
   * @param domainEvents - An array of domain events to publish.
   * @returns An array of promises that resolve when the events are published.
   */
  publishAll(domainEvents: DomainEventBase[]) {
    if (this._publisher.publishAll) {
      return this._publisher.publishAll(domainEvents);
    }
    return (domainEvents || []).map((event) => this._publisher.publish(event));
  }

  /**
   * Binds a domain event handler to the event stream.
   *
   * @param handler - The domain event handler to bind.
   * @param id - The ID of the domain event to bind the handler to. If not provided, the handler will be bound to all events.
   */
  bind(handler: IDomainEventHandler<DomainEventBase>, id: string) {
    const stream$ = id ? this.ofEventId(id) : this.subject$;
    const subscription = stream$
      .pipe(
        mergeMap((event: DomainEventBase) =>
          defer(() => Promise.resolve(handler.handle(event))).pipe(
            catchError((error) =>
              throwError(() => this.mapToUnhandledErrorInfo(event, error)),
            ),
          ),
        ),
      )
      .subscribe({
        error: (error) => {
          if (this.isUnhandledErrorInfo(error)) {
            this.unhandledExceptionBus.publish(error);
            error = error.exception;
          }
          this._logger.error(
            `${handler.constructor.name} has thrown an unhandled exception.`,
            error,
          );
        },
      });
    this._subscriptions.push(subscription);
  }

  /**
   * Registers sagas to handle domain events.
   *
   * @param types - An array of saga types to register.
   * @throws `DomainInvalidSagaException` if a saga instance is not found.
   */
  registerSagas(types: Type<unknown>[] = []) {
    const sagas = types
      .map((target) => {
        const metadata =
          Reflect.getMetadata(DOMAIN_SAGA_METADATA, target) || [];
        const instance = this.moduleRef.get(target, { strict: false });
        if (!instance) {
          throw new DomainInvalidSagaException(
            `Saga instance ${target} not found.`,
          );
        }
        return metadata.map((key: string) => instance[key].bind(instance));
      })
      .reduce((a, b) => a.concat(b), []);

    sagas.forEach((saga) => this.registerSaga(saga));
  }

  /**
   * Registers domain event handlers.
   *
   * @param handlers - An array of domain event handler types to register.
   */
  register(handlers: DomainEventHandlerType<DomainEventBase>[] = []) {
    handlers.forEach((handler) => this.registerHandler(handler));
  }

  /**
   * Registers a domain event handler.
   *
   * @param handler - The domain event handler type to register.
   */
  protected registerHandler(handler: DomainEventHandlerType<DomainEventBase>) {
    const instance = this.moduleRef.get(handler, { strict: false });
    if (!instance) {
      return;
    }
    const events = ReflectEventHelper.reflectEvents(handler);
    events.map((event) =>
      this.bind(
        instance as IDomainEventHandler<DomainEventBase>,
        ReflectEventHelper.getDomainEventId(event),
      ),
    );
  }

  /**
   * Filters the event stream by the ID of the domain event.
   *
   * @param id - The ID of the domain event to filter by.
   * @returns An observable stream of domain events with the specified ID.
   */
  protected ofEventId(id: string) {
    return this.subject$.pipe(
      filter(
        (event: DomainEventBase) =>
          ReflectEventHelper.getDomainEventId(event) === id,
      ),
    );
  }

  /**
   * Registers a saga to handle domain events.
   *
   * @param saga - The saga function to register.
   * @throws `DomainInvalidSagaException` if the saga is not a function or does not return an Observable.
   */
  protected registerSaga(saga: ISaga<DomainEventBase>) {
    if (typeof saga !== 'function') {
      throw new DomainInvalidSagaException('Saga must be a function.');
    }
    const stream$ = saga(this);
    if (!(stream$ instanceof Observable)) {
      throw new DomainInvalidSagaException('Saga must return an Observable.');
    }

    const subscription = stream$
      .pipe(
        filter((e) => !!e),
        mergeMap((command) =>
          defer(() => this.commandBus.execute(command)).pipe(
            catchError((error) =>
              throwError(() => this.mapToUnhandledErrorInfo(command, error)),
            ),
          ),
        ),
      )
      .subscribe({
        error: (error) => {
          if (this.isUnhandledErrorInfo(error)) {
            this.unhandledExceptionBus.publish(error);
            error = error.exception;
          }
          this._logger.error(
            `Command handler which execution was triggered by Saga has thrown an unhandled exception.`,
            error,
          );
        },
      });

    this._subscriptions.push(subscription);
  }

  /**
   * Uses the default domain event publisher.
   */
  private useDefaultPublisher() {
    this._publisher = new DefaultDomainEventPublisher<DomainEventBase>(
      this.subject$,
    );
  }

  /**
   * Maps an event or command and an exception to an `UnhandledExceptionInfo` object.
   *
   * @param eventOrCommand - The event or command that caused the exception.
   * @param exception - The exception that occurred.
   * @returns An `UnhandledExceptionInfo` object containing the event or command and the exception.
   */
  private mapToUnhandledErrorInfo(
    eventOrCommand: IDomainEvent | IDomainCommand,
    exception: unknown,
  ): UnhandledExceptionInfo {
    return {
      cause: eventOrCommand,
      exception,
    };
  }

  /**
   * Checks if an error object is an `UnhandledExceptionInfo` object.
   *
   * @param error - The error object to check.
   * @returns `true` if the error object is an `UnhandledExceptionInfo` object, `false` otherwise.
   */
  private isUnhandledErrorInfo(
    error: unknown,
  ): error is UnhandledExceptionInfo {
    return (
      typeof error === 'object' &&
      error !== null &&
      'cause' in error &&
      'exception' in error
    );
  }
}
