import { ObservableBus } from '../ddd-core';
import { IDomainEvent } from '../ddd-events';
import { IDomainCommand } from '../ddd-commands';

/**
 * Información sobre una excepción no manejada.
 */
export interface UnhandledExceptionInfo<Cause = IDomainEvent | IDomainCommand> {
  cause: Cause;
  exception: Error;
}

/**
 * Bus de excepciones no manejadas.
 */
export class UnhandledExceptionDomainBus<
  Cause = IDomainEvent | IDomainCommand,
> extends ObservableBus<UnhandledExceptionInfo<Cause>> {
  constructor() {
    super();
  }

  /**
   * Publica una excepción no manejada.
   */
  public publish(info: UnhandledExceptionInfo<Cause>): void {
    this.subject$.next(info);
  }
}
