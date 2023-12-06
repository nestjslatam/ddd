import { DateTimeHelper, DomainEventPublisher } from '@nestjslatam/ddd-lib';
import { CommandHandler } from '@nestjs/cqrs';

import {
  AbstractCommandHandler,
  MetaRequestContextService,
} from '../../../../../shared';
import { ChangePictureSingerCommand } from '../change-picture-singer';
import { SingerMapper } from '../../../../application/mappers';
import { SingerRepository } from '../../../../infrastructure/db';
import { PicturePath } from '../../../../domain';

@CommandHandler(ChangePictureSingerCommand)
export class ChangePictureSingerCommandHandler extends AbstractCommandHandler<ChangePictureSingerCommand> {
  constructor(
    protected readonly repository: SingerRepository,
    protected readonly publisher: DomainEventPublisher,
  ) {
    super(publisher);
  }

  async execute(command: ChangePictureSingerCommand): Promise<void> {
    const { newPicture, id } = command;

    const singerTable = await this.repository.findById(id);

    const singerMapped = SingerMapper.toDomain(singerTable);

    const audit = singerMapped
      .getProps()
      .audit.update(
        MetaRequestContextService.getUser(),
        DateTimeHelper.getUtcDate(),
      );

    singerMapped.changePicture(PicturePath.create(newPicture), audit);

    this.checkBusinessRules(singerMapped);

    const tableMapped = SingerMapper.toTable(singerMapped);

    this.repository.update(id, tableMapped);
  }
}
