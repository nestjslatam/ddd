import { DateTimeHelper, DomainEventPublisher } from '@nestjslatam/ddd-lib';
import { CommandHandler } from '@nestjs/cqrs';

import { SingerRepository } from '../../../../infrastructure/db';
import {
  AbstractCommandHandler,
  MetaRequestContextService,
} from '../../../../../shared';
import { SubscribeSingerCommand } from './susbcribe-singer.command';
import { SingerMapper } from '../../../../application/mappers';

@CommandHandler(SubscribeSingerCommand)
export class SubscribeSingerCommandHandler extends AbstractCommandHandler<SubscribeSingerCommand> {
  constructor(
    protected readonly repository: SingerRepository,
    protected readonly publisher: DomainEventPublisher,
  ) {
    super(publisher);
  }

  async execute(command: SubscribeSingerCommand): Promise<void> {
    const { singerId } = command;

    const singerTable = await this.repository.findById(singerId);

    const singerMapped = SingerMapper.toDomain(singerTable);

    const audit = singerMapped
      .getProps()
      .audit.update(
        MetaRequestContextService.getUser(),
        DateTimeHelper.getUtcDate(),
      );

    singerMapped.subscribe(audit);

    this.checkBusinessRules(singerMapped);

    const tableMapped = SingerMapper.toTable(singerMapped);

    this.repository.update(singerId, tableMapped);
  }
}
