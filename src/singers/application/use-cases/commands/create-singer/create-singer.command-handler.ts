import { DomainEventPublisher } from '@nestjslatam/ddd-lib';
import { CommandHandler } from '@nestjs/cqrs';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';

import { SingerTable } from '../../../../../database/tables';
import { SingerRepository } from '../../../../infrastructure/db';
import { Singer, eSingerStatus } from '../../../../domain/singer';
import { FullName, PicturePath } from '../../../../domain';
import { RegisterDate, AbstractCommandHandler } from '../../../../../shared';
import { CreateSingerCommand } from './create-singer.command';

@CommandHandler(CreateSingerCommand)
export class CreateSingerCommandHandler extends AbstractCommandHandler<CreateSingerCommand> {
  constructor(
    protected readonly repository: SingerRepository,
    @InjectMapper() protected readonly mapper: Mapper,
    protected readonly publisher: DomainEventPublisher,
  ) {
    super(publisher);
  }

  async execute(command: CreateSingerCommand): Promise<void> {
    const { fullName, picture } = command;

    const domain = Singer.create({
      fullName: FullName.create(fullName),
      picture: PicturePath.create(picture),
      registerDate: RegisterDate.create(new Date()),
      isSubscribed: false,
      status: eSingerStatus.Registered,
    });

    this.checkBusinessRules(domain);

    const tableMapped = await this.mapper.mapAsync(domain, Singer, SingerTable);

    this.repository.insert(tableMapped);

    this.publish(domain);
  }
}
