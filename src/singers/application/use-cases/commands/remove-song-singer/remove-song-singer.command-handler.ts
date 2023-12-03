import { DateTimeHelper, DomainEventPublisher } from '@nestjslatam/ddd-lib';
import { CommandHandler } from '@nestjs/cqrs';

import {
  SingerRepository,
  SongRepository,
} from '../../../../infrastructure/db';
import {
  AbstractCommandHandler,
  MetaRequestContextService,
} from '../../../../../shared';
import { RemoveSongToSingerCommand } from './remove-song-singer.command';
import { SingerMapper, SongMapper } from '../../../../application/mappers';

@CommandHandler(RemoveSongToSingerCommand)
export class RemoveSongToSingerCommandHandler extends AbstractCommandHandler<RemoveSongToSingerCommand> {
  constructor(
    protected readonly repository: SingerRepository,
    protected readonly songRepository: SongRepository,
    protected readonly publisher: DomainEventPublisher,
  ) {
    super(publisher);
  }

  async execute(command: RemoveSongToSingerCommand): Promise<void> {
    const { singerId, songId } = command;

    const singerTable = await this.repository.findById(singerId);

    const songTable = await this.songRepository.findById(songId);

    const singerMapped = SingerMapper.toDomain(singerTable);

    const songMapped = SongMapper.toDomain(songTable);

    const audit = singerMapped
      .getProps()
      .audit.update(
        MetaRequestContextService.getUser(),
        DateTimeHelper.getUtcDate(),
      );

    singerMapped.removeSong(songMapped, audit);

    this.checkBusinessRules(singerMapped);

    this.repository.removeSong(singerId, songTable);
  }
}
