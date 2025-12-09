import {
  DateTimeHelper,
  DomainAudit,
  DomainEventBus,
} from '@nestjslatam/ddd-lib';
import { CommandHandler } from '@nestjs/cqrs';

import { SingerRepository } from '../../../../infrastructure/db';
import { Singer, eSingerStatus } from '../../../../domain';
import { FullName, PicturePath } from '../../../../domain';
import {
  RegisterDate,
  AbstractCommandHandler,
  MetaRequestContextService,
  ApplicationException,
} from '../../../../../shared';
import { CreateSingerCommand } from './create-singer.command';

@CommandHandler(CreateSingerCommand)
export class CreateSingerCommandHandler extends AbstractCommandHandler<CreateSingerCommand> {
  constructor(
    protected readonly repository: SingerRepository,
    protected readonly eventBus: DomainEventBus,
  ) {
    super(eventBus);
  }

  async execute(command: CreateSingerCommand): Promise<void> {
    const { fullName, picture } = command;

    if (await this.repository.exists(fullName))
      throw new ApplicationException(
        `Singer with name ${fullName} already exists`,
      );

    const singer = Singer.create({
      fullName: FullName.create(fullName),
      picture: PicturePath.create(picture),
      registerDate: RegisterDate.create(new Date()),
      isSubscribed: false,
      status: eSingerStatus.Registered,
      audit: DomainAudit.create({
        createdBy: MetaRequestContextService.getUser(),
        createdAt: DateTimeHelper.getUtcDate(),
      }),
    });

    this.checkBusinessRules(singer);

    await this.repository.insert(singer);

    this.publish(singer);
  }
}
