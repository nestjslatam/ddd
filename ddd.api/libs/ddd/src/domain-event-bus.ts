import { Injectable, Logger, OnModuleDestroy, Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { from, Observable, Subscription } from 'rxjs';
import { filter, mergeMap } from 'rxjs/operators';

import { isFunction } from 'util';
import { DomainEvent } from './domaint-event';
import {
  IDomainEventBus,
  IDomainEventHandler,
  IDomainEventPublisher,
  IDomainSaga,
} from './interfaces';
import {
  DomainDefaultEventPublisher,
  DomainObservableBus,
  getDefaultDomainEventId,
  getDefaultReflectDomainEventId,
} from './utils';
import { DomainCommandBus } from './domain-command-bus';
import {
  DDD_DOMAIN_EVENTS_HANDLER_METADATA,
  DDD_SAGA_METADATA,
} from './decorators';
import { DomainInvalidSagaException } from './exceptions';

export type DomainEventHandlerType<
  TDomainEvent extends DomainEvent = DomainEvent,
> = Type<IDomainEventHandler<TDomainEvent>>;

@Injectable()
export class DomainEventBus<TDomainEvent extends DomainEvent = DomainEvent>
  extends DomainObservableBus<TDomainEvent>
  implements IDomainEventBus<TDomainEvent>, OnModuleDestroy
{
  protected getDomainEventId: (event: TDomainEvent) => string | null;
  protected readonly subscriptions: Subscription[];

  private _domainEventPublisher: IDomainEventPublisher<TDomainEvent>;
  private readonly _logger = new Logger(DomainEventBus.name);

  constructor(
    private readonly commandBus: DomainCommandBus,
    private readonly moduleRef: ModuleRef,
  ) {
    super();
    this.subscriptions = [];
    this.getDomainEventId = getDefaultDomainEventId;
    this.useDefaultPublisher();
  }

  get getDomainEventPublisher(): IDomainEventPublisher<TDomainEvent> {
    return this._domainEventPublisher;
  }

  set setDomainEventPublisher(_publisher: IDomainEventPublisher<TDomainEvent>) {
    this._domainEventPublisher = _publisher;
  }

  onModuleDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  publish(domainEvent: TDomainEvent) {
    return this._domainEventPublisher.publish(domainEvent);
  }

  publishAll(domainEvents: TDomainEvent[]) {
    if (this._domainEventPublisher.publishAll) {
      return this._domainEventPublisher.publishAll(domainEvents);
    }
    return (domainEvents || []).map((event) =>
      this._domainEventPublisher.publish(event),
    );
  }

  bind(domainEventHandler: IDomainEventHandler<TDomainEvent>, id: string) {
    const stream$ = id ? this.ofDomainEventId(id) : this.subject$;
    const subscription = stream$
      .pipe(
        mergeMap((event) =>
          from(Promise.resolve(domainEventHandler.handle(event))),
        ),
      )
      .subscribe({
        error: (error) => {
          this._logger.error(
            `"${domainEventHandler.constructor.name}" has thrown an error.`,
            error,
          );
          throw error;
        },
      });
    this.subscriptions.push(subscription);
  }

  registerSagas(types: Type<unknown>[] = []) {
    const sagas = types
      .map((target) => {
        const metadata = Reflect.getMetadata(DDD_SAGA_METADATA, target) || [];
        const instance = this.moduleRef.get(target, { strict: false });
        if (!instance) {
          throw new DomainInvalidSagaException();
        }
        return metadata.map((key: string) => instance[key].bind(instance));
      })
      .reduce((a, b) => a.concat(b), []);

    sagas.forEach((saga) => this.registerSaga(saga));
  }

  register(
    domainEventHandlerTypes: DomainEventHandlerType<TDomainEvent>[] = [],
  ) {
    domainEventHandlerTypes.forEach((handler) => this.registerHandler(handler));
  }

  protected registerHandler(
    domainEventHandler: DomainEventHandlerType<TDomainEvent>,
  ) {
    const instance = this.moduleRef.get(domainEventHandler, { strict: false });
    if (!instance) {
      return;
    }
    const events = this.reflectEvents(domainEventHandler);
    events.map((event: any) =>
      this.bind(
        instance as IDomainEventHandler<TDomainEvent>,
        getDefaultReflectDomainEventId(event),
      ),
    );
  }

  protected ofDomainEventId(id: string) {
    return this.subject$.pipe(
      filter((event) => this.getDomainEventId(event) === id),
    );
  }

  protected registerSaga(saga: IDomainSaga<TDomainEvent>) {
    if (!isFunction(saga)) {
      throw new DomainInvalidSagaException();
    }
    const stream$ = saga(this);
    if (!(stream$ instanceof Observable)) {
      throw new DomainInvalidSagaException();
    }

    const subscription = stream$
      .pipe(
        filter((e) => !!e),
        mergeMap((command) => from(this.commandBus.execute(command))),
      )
      .subscribe({
        error: (error) => {
          this._logger.error(
            `Command handler which execution was triggered by Saga has thrown an error.`,
            error,
          );
          throw error;
        },
      });

    this.subscriptions.push(subscription);
  }

  private reflectEvents(
    domainEventHandlerType: DomainEventHandlerType<TDomainEvent>,
  ): FunctionConstructor[] {
    return Reflect.getMetadata(
      DDD_DOMAIN_EVENTS_HANDLER_METADATA,
      domainEventHandlerType,
    );
  }

  private useDefaultPublisher() {
    this._domainEventPublisher = new DomainDefaultEventPublisher<TDomainEvent>(
      this.subject$,
    );
  }
}
