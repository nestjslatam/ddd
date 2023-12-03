import { DomainEventPublisher } from '@nestjslatam/ddd-lib';
import { CommandHandler } from '@nestjs/cqrs';

import { SingerRepository } from '../../../../infrastructure/db';
import { AbstractCommandHandler } from '../../../../../shared';
import { RemoveSingerCommand } from './remove-singer.command';
import { SingerMapper } from '../../../../application/mappers';

@CommandHandler(RemoveSingerCommand)
export class RemoveSingerCommandHandler extends AbstractCommandHandler<RemoveSingerCommand> {
  constructor(
    protected readonly repository: SingerRepository,
    protected readonly publisher: DomainEventPublisher,
  ) {
    super(publisher);
  }

  async execute(command: RemoveSingerCommand): Promise<void> {
    const { singerId } = command;

    const singerTable = await this.repository.findById(singerId);

    const singerDomain = SingerMapper.toDomain(singerTable);

    singerDomain.remove();

    this.checkBusinessRules(singerDomain);

    this.repository.delete(singerId);
  }
}
