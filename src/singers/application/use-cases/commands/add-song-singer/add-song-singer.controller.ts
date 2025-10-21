import { Body, Controller, Param, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { AddSongToSingerDto } from './add-song-singer.dto';
import { AddSongToSingerCommand } from './add-song-singer.command';

@Controller('singers')
export class AddSongToSingerController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('/addsong/:id')
  async addSong(
    @Param('id') id: string,
    @Body() addSongToSinger: AddSongToSingerDto,
  ): Promise<void> {
    if (!addSongToSinger || addSongToSinger === undefined) return;

    const { songName, trackingId } = addSongToSinger;

    return await this.commandBus.execute(
      new AddSongToSingerCommand(id, songName, trackingId),
    );
  }
}
