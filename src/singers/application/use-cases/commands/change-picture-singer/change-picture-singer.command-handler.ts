import { DateTimeHelper, DomainEventPublisher } from '@nestjslatam/ddd-lib';
import { CommandHandler } from '@nestjs/cqrs';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';

import { SingerTable } from '../../../../../database/tables';
import { SingerRepository } from '../../../../infrastructure/db';
import { PicturePath, Singer } from '../../../../domain';
import {
  AbstractCommandHandler,
  MetaRequestContextService,
} from '../../../../../shared';
import { ChangePictureSingerCommand } from '../change-picture-singer';

@CommandHandler(ChangePictureSingerCommand)
export class ChangePictureSingerCommandHandler extends AbstractCommandHandler<ChangePictureSingerCommand> {
  constructor(
    protected readonly repository: SingerRepository,
    @InjectMapper() protected readonly mapper: Mapper,
    protected readonly publisher: DomainEventPublisher,
  ) {
    super(publisher);
  }

  async execute(command: ChangePictureSingerCommand): Promise<void> {
    const { newPicture, singerId } = command;

    const singerTable = await this.repository.findById(singerId);

    const singerMapped = await this.mapper.mapAsync(
      singerTable,
      SingerTable,
      Singer,
    );

    const audit = singerMapped
      .getProps()
      .audit.update(
        MetaRequestContextService.getUser(),
        DateTimeHelper.getUtcDate(),
      );

    singerMapped.changePicture(PicturePath.create(newPicture), audit);

    this.checkBusinessRules(singerMapped);

    const tableMapped = await this.mapper.mapAsync(
      singerMapped,
      Singer,
      SingerTable,
    );

    this.repository.update(singerId, tableMapped);
  }
}
