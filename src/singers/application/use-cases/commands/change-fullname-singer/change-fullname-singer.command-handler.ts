import { DateTimeHelper, DomainEventPublisher } from '@nestjslatam/ddd-lib';
import { CommandHandler } from '@nestjs/cqrs';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';

import { SingerTable } from '../../../../../database/tables';

import { Singer } from '../../../../domain/singers';
import { PicturePath } from '../../../../domain';
import {
  AbstractCommandHandler,
  MetaRequestContextService,
} from '../../../../../shared';
import { SingerRepository } from '../../../../infrastructure/db';
import { ChangeFullNameSingerCommand } from './change-fullname-singer.command';

@CommandHandler(ChangeFullNameSingerCommand)
export class ChangeFullNameSingerCommandHandler extends AbstractCommandHandler<ChangeFullNameSingerCommand> {
  constructor(
    protected readonly repository: SingerRepository,
    @InjectMapper() protected readonly mapper: Mapper,
    protected readonly publisher: DomainEventPublisher,
  ) {
    super(publisher);
  }

  async execute(command: ChangeFullNameSingerCommand): Promise<void> {
    const { newFullName, singerId } = command;

    const tableFound = await this.repository.findById(singerId);

    const domainMapped = await this.mapper.mapAsync(
      tableFound,
      SingerTable,
      Singer,
    );

    const audit = domainMapped
      .getProps()
      .audit.update(
        MetaRequestContextService.getUser(),
        DateTimeHelper.getUtcDate(),
      );

    domainMapped.changePicture(new PicturePath(newFullName), audit);

    this.checkBusinessRules(domainMapped);

    const tableMapped = await this.mapper.mapAsync(
      domainMapped,
      Singer,
      SingerTable,
    );

    this.repository.update(singerId, tableMapped);

    this.publish(domainMapped);
  }
}
