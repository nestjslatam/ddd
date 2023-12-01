import { DomainEventPublisher } from '@nestjslatam/ddd-lib';
import { CommandHandler } from '@nestjs/cqrs';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';

import { Singer } from '../../../../domain';
import { SingerRepository } from '../../../../infrastructure/db';
import { AbstractCommandHandler } from '../../../../../shared';
import { SingerTable } from '../../../../../database/tables';
import { RemoveSingerCommand } from './remove-singer.command';

@CommandHandler(RemoveSingerCommand)
export class RemoveSingerCommandHandler extends AbstractCommandHandler<RemoveSingerCommand> {
  constructor(
    protected readonly repository: SingerRepository,
    @InjectMapper() protected readonly mapper: Mapper,
    protected readonly publisher: DomainEventPublisher,
  ) {
    super(publisher);
  }

  async execute(command: RemoveSingerCommand): Promise<void> {
    const { singerId } = command;

    const singerTable = await this.repository.findById(singerId);

    const singerDomain = await this.mapper.mapAsync(
      singerTable,
      SingerTable,
      Singer,
    );

    singerDomain.remove();

    this.checkBusinessRules(singerDomain);

    this.repository.delete(singerId);
  }
}
