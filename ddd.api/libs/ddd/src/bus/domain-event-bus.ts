import { OnModuleDestroy, Injectable, Logger } from '@nestjs/common';
import {
  ICommand,
  IDomainEventBus,
  IDomainEventHandler,
  IDomainEventPublisher,
  ISaga,
  UnhandledExceptionInfo,
} from './core/interfaces';

import {
  Observable,
  Subscription,
  catchError,
  defer,
  filter,
  mergeMap,
  throwError,
} from 'rxjs';

import { ModuleRef } from '@nestjs/core';
import { DefaultPubSubHelper, defaultGetDomainEventIdHelper } from './helpers';
import { IDomainEvent } from '@nestjslatam/ddd';
import { ObservableBus } from './core';
import { DomainCommandBus } from './domain-command-bus';
import { UnhandledExceptionBus } from './unhandled-exeption-bus';
import {
  DOMAIN_EVENTS_HANDLER_METADATA,
  DOMAIN_SAGA_METADATA,
} from './decorators';
import { DomainInvalidSagaException } from '../exceptions';
import { Type } from '../type.interface';

export type DomainEventHandlerType<
  DomainEventBase extends IDomainEvent = IDomainEvent,
> = Type<IDomainEventHandler<DomainEventBase>>;

@Injectable()
export class DomainEventBus<DomainEventBase extends IDomainEvent = IDomainEvent>
  extends ObservableBus<DomainEventBase>
  implements IDomainEventBus<DomainEventBase>, OnModuleDestroy
{
  protected getDomainEventId: (domainEvent: DomainEventBase) => string | null;
  protected readonly subscriptions: Subscription[];
  private _publisher: IDomainEventPublisher<DomainEventBase>;
  private readonly _logger = new Logger(DomainEventBus.name);

  constructor(
    private readonly commandBus: DomainCommandBus,
    private readonly moduleRef: ModuleRef,
    private readonly unhandledExceptionBus: UnhandledExceptionBus,
  ) {
    super();

    this.subscriptions = [];
    this.getDomainEventId = defaultGetDomainEventIdHelper;
    this.useDefaultPublisher();
  }

  get publisher(): IDomainEventPublisher<DomainEventBase> {
    return this._publisher;
  }

  set publisher(value: IDomainEventPublisher<DomainEventBase>) {
    this._publisher = value;
  }

  onModuleDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  publish<T extends DomainEventBase>(domainEvent: T) {
    return this._publisher.publish(domainEvent);
  }

  publishAll(domainEvents: DomainEventBase[]) {
    if (this._publisher.publishAll) {
      return this._publisher.publishAll(domainEvents);
    }
    return (domainEvents || []).map((event) => this._publisher.publish(event));
  }

  bind(handler: IDomainEventHandler<DomainEventBase>, id: string) {
    const stream$ = id ? this.ofEventId(id) : this.subject$;
    const subscription = stream$
      .pipe(
        mergeMap((event) =>
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
            `"${handler.constructor.name}" has thrown an unhandled exception.`,
            error,
          );
        },
      });
    this.subscriptions.push(subscription);
  }

  registerSagas(types: Type<unknown>[] = []) {
    const sagas = types
      .map((target) => {
        const metadata =
          Reflect.getMetadata(DOMAIN_SAGA_METADATA, target) || [];
        const instance = this.moduleRef.get(target, { strict: false });
        if (!instance) {
          throw new DomainInvalidSagaException('Saga instance not found.');
        }
        return metadata.map((key: string) => instance[key].bind(instance));
      })
      .reduce((a, b) => a.concat(b), []);

    sagas.forEach((saga) => this.registerSaga(saga));
  }

  register(handlers: DomainEventHandlerType<DomainEventBase>[] = []) {
    handlers.forEach((handler) => this.registerHandler(handler));
  }

  protected registerHandler(handler: DomainEventHandlerType<DomainEventBase>) {
    const instance = this.moduleRef.get(handler, { strict: false });
    if (!instance) {
      return;
    }
    const events = this.reflectEvents(handler);
    events.map((event) =>
      this.bind(
        instance as IDomainEventHandler<DomainEventBase>,
        defaultGetDomainEventIdHelper(event),
      ),
    );
  }

  protected ofEventId(id: string) {
    return this.subject$.pipe(
      filter((event) => this.getDomainEventId(event) === id),
    );
  }

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

    this.subscriptions.push(subscription);
  }

  private reflectEvents(
    handler: DomainEventHandlerType<DomainEventBase>,
  ): FunctionConstructor[] {
    return Reflect.getMetadata(DOMAIN_EVENTS_HANDLER_METADATA, handler);
  }

  private useDefaultPublisher() {
    this._publisher = new DefaultPubSubHelper<DomainEventBase>(this.subject$);
  }

  private mapToUnhandledErrorInfo(
    eventOrCommand: IDomainEvent | ICommand,
    exception: unknown,
  ): UnhandledExceptionInfo {
    return {
      cause: eventOrCommand,
      exception,
    };
  }

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
