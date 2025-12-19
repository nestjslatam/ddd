import { DateTimeHelper, DomainEventBus } from '@nestjslatam/ddd-lib';
import { CommandHandler } from '@nestjs/cqrs';

import { SingerRepository } from '../../../../infrastructure/db';
import {
  AbstractCommandHandler,
  MetaRequestContextService,
} from '../../../../../shared';
import { SubscribeSingerCommand } from './susbcribe-singer.command';

@CommandHandler(SubscribeSingerCommand)
export class SubscribeSingerCommandHandler extends AbstractCommandHandler<SubscribeSingerCommand> {
  constructor(
    protected readonly repository: SingerRepository,
    protected readonly eventBus: DomainEventBus,
  ) {
    super(eventBus);
  }

  async execute(command: SubscribeSingerCommand): Promise<void> {
    const { singerId } = command;

    const singer = await this.repository.findById(singerId);

    const audit = singer.props.audit.update(
      MetaRequestContextService.getUser(),
      DateTimeHelper.getUtcDate(),
    );

    singer.subscribe(audit);

    this.checkBusinessRules(singer);

    await this.repository.update(singerId, singer);
    this.publish(singer);
  }
}
