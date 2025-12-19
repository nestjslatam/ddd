import {
  DateTimeHelper,
  DomainAudit,
  DomainEventBus,
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

@CommandHandler(AddSongToSingerCommand)
export class AddSongToSingerCommandHandler extends AbstractCommandHandler<AddSongToSingerCommand> {
  constructor(
    protected readonly repository: SingerRepository,
    protected readonly eventBus: DomainEventBus,
  ) {
    super(eventBus);
  }

  async execute(command: AddSongToSingerCommand): Promise<void> {
    const { id, songName } = command;

    const singer = await this.repository.findById(id);

    if (!singer) {
      throw new Error('Singer not found');
    }

    const songCreated = Song.create(
      Id.fromRaw(id),
      Name.create(songName),
      DomainAudit.create({
        createdBy: MetaRequestContextService.getUser(),
        createdAt: DateTimeHelper.getUtcDate(),
      }),
    );

    singer.addSong(
      songCreated,
      DomainAudit.create({
        createdBy: MetaRequestContextService.getUser(),
        createdAt: DateTimeHelper.getUtcDate(),
      }),
    );

    this.checkBusinessRules(songCreated);

    await this.repository.addSong(singer, songCreated);
  }
}
