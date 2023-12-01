import { DomainEventPublisher } from '@nestjslatam/ddd-lib';
import { CommandHandler } from '@nestjs/cqrs';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';

import { SingerTable, SongTable } from '../../../../../database/tables';
import {
  SingerRepository,
  SongRepository,
} from '../../../../infrastructure/db';
import { AbstractCommandHandler } from '../../../../../shared';
import { RemoveSongToSingerCommand } from './remove-song-singer.command';
import { Singer, Song } from '../../../../domain';

@CommandHandler(RemoveSongToSingerCommand)
export class RemoveSongToSingerCommandHandler extends AbstractCommandHandler<RemoveSongToSingerCommand> {
  constructor(
    protected readonly repository: SingerRepository,
    protected readonly songRepository: SongRepository,
    @InjectMapper() protected readonly mapper: Mapper,
    protected readonly publisher: DomainEventPublisher,
  ) {
    super(publisher);
  }

  async execute(command: RemoveSongToSingerCommand): Promise<void> {
    const { singerId, songId } = command;

    const singerTable = await this.repository.findById(singerId);

    const songTable = await this.songRepository.findById(songId);

    const singerMapped = await this.mapper.mapAsync(
      singerTable,
      SingerTable,
      Singer,
    );

    const songCreated = Song.load({
      id: songId,
      name: songTable.name,
      singerId: singerId,
      status: songTable.status,
      audit: {
        createdBy: songTable.audit.createdBy,
        createdDate: songTable.audit.createdAt,
        updatedBy: songTable.audit.updatedBy,
        updatedDate: songTable.audit.updatedAt,
      },
    });

    singerMapped.removeSong(songCreated);

    this.checkBusinessRules(singerMapped);

    const tableMapped = await this.mapper.mapAsync(
      songCreated,
      Song,
      SongTable,
    );

    this.repository.removeSong(singerId, tableMapped);
  }
}
