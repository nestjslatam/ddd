import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

import { SongController } from './application/song.controller';
import { SongService } from './application/song.service';
import { SongRepository } from './infraestructure/db';
import { SingerTable, SongTable } from '../database/tables';

@Module({
  imports: [TypeOrmModule.forFeature([SongTable, SingerTable])],
  controllers: [SongController],
  providers: [SongService, SongRepository],
})
export class SongsModule {}
