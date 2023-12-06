import {
  DateTimeHelper,
  DomainAudit,
  DomainEventPublisher,
} from '@nestjslatam/ddd-lib';
import { CommandHandler } from '@nestjs/cqrs';

import { SingerRepository } from '../../../../infrastructure/db';
import {
  AbstractCommandHandler,
  Id,
  MetaRequestContextService,
  Name,
} from '../../../../../shared';
import { AddSongToSingerCommand } from './add-song-singer.command';
import { Song } from '../../../../domain';
import { SingerMapper, SongMapper } from '../../../../application/mappers';

@CommandHandler(AddSongToSingerCommand)
export class AddSongToSingerCommandHandler extends AbstractCommandHandler<AddSongToSingerCommand> {
  constructor(
    protected readonly repository: SingerRepository,
    protected readonly publisher: DomainEventPublisher,
  ) {
    super(publisher);
  }

  async execute(command: AddSongToSingerCommand): Promise<void> {
    const { id, songName } = command;

    const singerTable = await this.repository.findById(id);

    const singerMapped = SingerMapper.toDomain(singerTable);

    const songCreated = Song.create(
      Id.load(id),
      Name.create(songName),
      DomainAudit.create({
        createdBy: MetaRequestContextService.getUser(),
        createdAt: DateTimeHelper.getUtcDate(),
      }),
    );

    this.checkBusinessRules(songCreated);

    singerMapped.addSong(
      songCreated,
      DomainAudit.create({
        createdBy: MetaRequestContextService.getUser(),
        createdAt: DateTimeHelper.getUtcDate(),
      }),
    );

    this.checkBusinessRules(singerMapped);

    const tableMapped = SongMapper.toTable(songCreated);

    this.repository.addSong(id, tableMapped);
  }
}
