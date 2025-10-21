import { DateTimeHelper, DomainEventPublisher } from '@nestjslatam/ddd-lib';
import { CommandHandler } from '@nestjs/cqrs';

import {
  AbstractCommandHandler,
  MetaRequestContextService,
} from '../../../../../shared';
import { ChangePictureSingerCommand } from '../change-picture-singer';

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

    const singer = await this.repository.findById(id);

    const audit = singer.props.audit.update(
      MetaRequestContextService.getUser(),
      DateTimeHelper.getUtcDate(),
    );

    singer.changePicture(PicturePath.create(newPicture), audit);

    this.checkBusinessRules(singer);

    await this.repository.update(id, singer);
  }
}
