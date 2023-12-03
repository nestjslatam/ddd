import {
  DateTimeHelper,
  DomainAuditValueObject,
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
    const { singerId, songName } = command;

    const singerTable = await this.repository.findById(singerId);

    const singerMapped = SingerMapper.toDomain(singerTable);

    const songCreated = Song.create(
      Id.load(singerId),
      Name.create(songName),
      DomainAuditValueObject.create(
        MetaRequestContextService.getUser(),
        DateTimeHelper.getUtcDate(),
      ),
    );

    singerMapped.addSong(
      songCreated,
      DomainAuditValueObject.create(
        MetaRequestContextService.getUser(),
        DateTimeHelper.getUtcDate(),
      ),
    );

    this.checkBusinessRules(songCreated);

    const tableMapped = SongMapper.toTable(songCreated);

    this.repository.addSong(singerId, tableMapped);
  }
}
