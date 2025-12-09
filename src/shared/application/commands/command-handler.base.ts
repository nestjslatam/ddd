import { ICommandHandler } from '@nestjs/cqrs';
import {
  DomainAggregateRoot,
  DomainEntity,
  DomainEventBus,
} from '@nestjslatam/ddd-lib';
import { DomainException } from 'src/shared/exceptions';

export abstract class AbstractCommandHandler<TCommand>
  implements ICommandHandler<TCommand>
{
  constructor(protected readonly eventBus?: DomainEventBus) {}

  abstract execute(command: TCommand): Promise<void>;

  checkBusinessRules(domain: DomainEntity<any>): void {
    if (!domain.IsValid) {
      throw new DomainException(domain.BrokenRules.asString());
    }
  }

  publish(domain: DomainAggregateRoot<any>): void {
    const events = domain.commit();
    this.eventBus.publishAll(events);
  }
}
