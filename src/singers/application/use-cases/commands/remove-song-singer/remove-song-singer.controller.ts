import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { RemoveSongToSingerDto } from './remove-song-singer.dto';
import { RemoveSongToSingerCommand } from './remove-song-singer.command';

@Controller('singers')
export class RemoveSongToSingerController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  async RemoveSong(
    @Body() removeSongToSinger: RemoveSongToSingerDto,
  ): Promise<void> {
    if (!removeSongToSinger || removeSongToSinger === undefined) return;

    const { songId, singerId, trackingId } = removeSongToSinger;

    return await this.commandBus.execute(
      new RemoveSongToSingerCommand(singerId, songId, trackingId),
    );
  }
}
