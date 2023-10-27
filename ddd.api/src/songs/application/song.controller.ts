import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { SongService } from './song.service';
import { CreateSongDto } from './dto/create-song.dto';
import { UpdateNameSongDto } from './dto/update-name-song';
import { UpdateLyricSongDto } from './dto/update-lyric-song';
import { UpdateSongDto } from './dto/update-song.dto';
import { SongInfoDto } from './dto/song-info.dto';

@Controller('songs')
export class SongController {
  constructor(private readonly songService: SongService) {}

  @Get(':artistId')
  async GetAllBySingerId(@Param() singerId: string): Promise<SongInfoDto[]> {
    return await this.songService.findAllBySingerId(singerId);
  }

  @Get(':id')
  async FindOneById(@Param('id') id: string): Promise<SongInfoDto> {
    return await this.songService.findOneById(id);
  }

  @Post()
  async Create(@Body() createDto: CreateSongDto): Promise<void> {
    return await this.songService.create(createDto);
  }

  @Patch(':id')
  async ChangeName(
    @Param('id') id: string,
    @Body() updateNameDto: UpdateNameSongDto,
  ): Promise<void> {
    return this.songService.changeName(id, updateNameDto.newName);
  }

  @Post(':id')
  async uploadLyric(
    @Param('id') id: string,
    @Body() updateLyricDto: UpdateLyricSongDto,
  ): Promise<void> {
    return this.songService.uploadLyric(id, updateLyricDto.newLyric);
  }

  @Patch(':id')
  async Update(
    @Param('id') id: string,
    @Body() updateDto: UpdateSongDto,
  ): Promise<void> {
    return this.songService.update(id, updateDto);
  }

  @Delete(':id')
  async Delete(@Param('id') id: string): Promise<void> {
    return this.songService.delete(id);
  }
}
