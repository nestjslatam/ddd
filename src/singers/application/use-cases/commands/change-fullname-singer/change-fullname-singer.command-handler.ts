import { DateTimeHelper, DomainEventPublisher } from '@nestjslatam/ddd-lib';
import { CommandHandler } from '@nestjs/cqrs';

import { SingerTable } from '../../../../../database/tables';
import { FullName, Singer } from '../../../../domain/singers';
import {
  AbstractCommandHandler,
  MetaRequestContextService,
} from '../../../../../shared';
import { SingerRepository } from '../../../../infrastructure/db';
import { ChangeFullNameSingerCommand } from './change-fullname-singer.command';
import { SingerMapper } from '../../../../application/mappers';

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

    const tableFound = await this.repository.findById(id);

    const domainMapped = SingerMapper.toDomain(tableFound);

    const audit = domainMapped
      .getProps()
      .audit.update(
        MetaRequestContextService.getUser(),
        DateTimeHelper.getUtcDate(),
      );

    domainMapped.changeFullName(FullName.create(newFullName), audit);

    this.checkBusinessRules(domainMapped);

    const tableMapped = SingerMapper.toTable(domainMapped);

    this.repository.update(id, tableMapped);

    this.publish(domainMapped);
  }
}
