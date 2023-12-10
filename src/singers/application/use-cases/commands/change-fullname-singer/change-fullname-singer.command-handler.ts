import { DateTimeHelper, DomainEventPublisher } from '@nestjslatam/ddd-lib';
import { CommandHandler } from '@nestjs/cqrs';

import {
  AbstractCommandHandler,
  MetaRequestContextService,
} from '../../../../../shared';
import { SingerRepository } from '../../../../infrastructure/db';
import { ChangeFullNameSingerCommand } from './change-fullname-singer.command';
import { FullName } from 'src/singers/domain';

@CommandHandler(ChangeFullNameSingerCommand)
export class ChangeFullNameSingerCommandHandler extends AbstractCommandHandler<ChangeFullNameSingerCommand> {
  constructor(
    protected readonly repository: SingerRepository,
    protected readonly publisher: DomainEventPublisher,
  ) {
    super(publisher);
  }

  async execute(command: ChangeFullNameSingerCommand): Promise<void> {
    const { newFullName, id } = command;

    const singer = await this.repository.findById(id);

    const audit = singer
      .getProps()
      .audit.update(
        MetaRequestContextService.getUser(),
        DateTimeHelper.getUtcDate(),
      );

    singer.changeFullName(FullName.create(newFullName), audit);

    this.checkBusinessRules(singer);

    this.repository.update(id, singer);

    this.publish(singer);
  }
}
