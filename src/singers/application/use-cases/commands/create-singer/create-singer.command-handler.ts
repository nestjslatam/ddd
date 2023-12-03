import {
  DateTimeHelper,
  DomainAuditValueObject,
  DomainEventPublisher,
} from '@nestjslatam/ddd-lib';
import { CommandHandler } from '@nestjs/cqrs';

import { SingerRepository } from '../../../../infrastructure/db';
import { Singer, eSingerStatus } from '../../../../domain/singers';
import { FullName, PicturePath } from '../../../../domain';
import {
  RegisterDate,
  AbstractCommandHandler,
  MetaRequestContextService,
  ApplicationException,
} from '../../../../../shared';
import { CreateSingerCommand } from './create-singer.command';
import { SingerMapper } from 'src/singers/application/mappers';

@CommandHandler(CreateSingerCommand)
export class CreateSingerCommandHandler extends AbstractCommandHandler<CreateSingerCommand> {
  constructor(
    protected readonly repository: SingerRepository,
    protected readonly publisher: DomainEventPublisher,
  ) {
    super(publisher);
  }

  async execute(command: CreateSingerCommand): Promise<void> {
    const { fullName, picture } = command;

    if (await this.repository.exists(fullName))
      throw new ApplicationException(
        `Singer with name ${fullName} already exists`,
      );

    const domain = Singer.create({
      fullName: FullName.create(fullName),
      picture: PicturePath.create(picture),
      registerDate: RegisterDate.create(new Date()),
      isSubscribed: false,
      status: eSingerStatus.Registered,
      audit: DomainAuditValueObject.create(
        MetaRequestContextService.getUser(),
        DateTimeHelper.getUtcDate(),
      ),
    });

    this.checkBusinessRules(domain);

    const tableMapped = SingerMapper.toTable(domain);

    this.repository.insert(tableMapped);

    this.publish(domain);
  }
}
