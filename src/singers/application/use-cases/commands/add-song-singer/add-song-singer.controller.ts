import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { AddSongToSingerDto } from './add-song-singer.dto';
import { AddSongToSingerCommand } from './add-song-singer.command';

@Controller('singers')
export class AddSongToSingerController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  async addSong(@Body() addSongToSinger: AddSongToSingerDto): Promise<void> {
    if (!addSongToSinger || addSongToSinger === undefined) return;

    const { songName, singerId, trackingId } = addSongToSinger;

    return await this.commandBus.execute(
      new AddSongToSingerCommand(singerId, songName, trackingId),
    );
  }
}
