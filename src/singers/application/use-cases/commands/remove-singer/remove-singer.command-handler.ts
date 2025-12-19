import { CommandHandler } from '@nestjs/cqrs';
import { DomainEventBus, DateTimeHelper } from '@nestjslatam/ddd-lib';

import { SingerRepository } from '../../../../infrastructure/db';
import {
  AbstractCommandHandler,
  ApplicationException,
  MetaRequestContextService,
} from '../../../../../shared';
import { RemoveSingerCommand } from './remove-singer.command';

@CommandHandler(RemoveSingerCommand)
export class RemoveSingerCommandHandler extends AbstractCommandHandler<RemoveSingerCommand> {
  constructor(
    protected readonly repository: SingerRepository,
    protected readonly eventBus: DomainEventBus,
  ) {
    super(eventBus);
  }

  async execute(command: RemoveSingerCommand): Promise<void> {
    const { id } = command;

    const singer = await this.repository.findById(id);

    if (!singer) {
      throw new ApplicationException(`Singer with id ${id} not found`);
    }

    const audit = singer.props.audit.update(
      MetaRequestContextService.getUser(),
      DateTimeHelper.getUtcDate(),
    );

    singer.remove(audit);

    this.checkBusinessRules(singer);

    await this.repository.update(id, singer);

    this.publish(singer);
  }
}
