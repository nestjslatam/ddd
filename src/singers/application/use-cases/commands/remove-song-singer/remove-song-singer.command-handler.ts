import { DateTimeHelper, DomainEventBus } from '@nestjslatam/ddd-lib';
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

@CommandHandler(RemoveSongToSingerCommand)
export class RemoveSongToSingerCommandHandler extends AbstractCommandHandler<RemoveSongToSingerCommand> {
  constructor(
    protected readonly repository: SingerRepository,
    protected readonly songRepository: SongRepository,
    protected readonly eventBus: DomainEventBus,
  ) {
    super(eventBus);
  }

  async execute(command: RemoveSongToSingerCommand): Promise<void> {
    const { singerId, songId } = command;

    const singer = await this.repository.findById(singerId);

    const song = await this.songRepository.findById(songId);

    const audit = singer.props.audit.update(
      MetaRequestContextService.getUser(),
      DateTimeHelper.getUtcDate(),
    );

    singer.removeSong(song, audit);

    this.checkBusinessRules(singer);

    await this.repository.removeSong(singer, song);
  }
}
