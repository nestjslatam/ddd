import { DomainEventPublisher } from '@nestjslatam/ddd-lib';
import { CommandHandler } from '@nestjs/cqrs';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';

import { SingerTable, SongTable } from '../../../../../database/tables';
import { SingerRepository } from '../../../../infrastructure/db';
import { AbstractCommandHandler, Id, Name } from '../../../../../shared';
import { AddSongToSingerCommand } from './add-song-singer.command';
import { Singer, SingerSong, Song } from '../../../../domain';

@CommandHandler(AddSongToSingerCommand)
export class AddSongToSingerCommandHandler extends AbstractCommandHandler<AddSongToSingerCommand> {
  constructor(
    protected readonly repository: SingerRepository,
    @InjectMapper() protected readonly mapper: Mapper,
    protected readonly publisher: DomainEventPublisher,
  ) {
    super(publisher);
  }

  async execute(command: AddSongToSingerCommand): Promise<void> {
    const { singerId, songName } = command;

    const singerTable = await this.repository.findById(singerId);

    const singerMapped = await this.mapper.mapAsync(
      singerTable,
      SingerTable,
      Singer,
    );

    const songCreated = Song.create(Name.create(songName));

    this.checkBusinessRules(songCreated);

    const singerSongCreated = SingerSong.create({
      songId: Id.load(songCreated.getId()),
      songName: Name.create(songName),
    });

    singerMapped.addSong(singerSongCreated);

    this.checkBusinessRules(singerMapped);

    const tableMapped = await this.mapper.mapAsync(
      songCreated,
      Song,
      SongTable,
    );

    this.repository.addSong(singerId, tableMapped);
  }
}