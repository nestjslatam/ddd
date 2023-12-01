import { ICommandHandler } from '@nestjs/cqrs';
import {
  DomainAggregateRoot,
  DomainEntity,
  DomainEventPublisher,
} from '@nestjslatam/ddd-lib';
import { DomainException } from 'src/shared/exceptions';

export abstract class AbstractCommandHandler<TCommand>
  implements ICommandHandler<TCommand>
{
  constructor(protected readonly publisher?: DomainEventPublisher) {}

  abstract execute(command: TCommand): Promise<void>;

  checkBusinessRules(domain: DomainEntity<any>): void {
    if (!domain.getIsValid()) {
      throw new DomainException(domain.getBrokenRulesAsString());
    }
  }

  publish(domain: DomainAggregateRoot<any>): void {
    const domainToPublish = this.publisher.mergeObjectContext(domain);

    domainToPublish.commit();
  }
}
