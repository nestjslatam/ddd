import { Module } from '@nestjs/common';
import { SongController } from './application/song.controller';
import { SongService } from './application/song.service';
import { SongRepository } from './infraestructure/db';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SongTable } from '../database/tables';

@Module({
  imports: [TypeOrmModule.forFeature([SongTable])],
  controllers: [SongController],
  providers: [SongService, SongRepository],
})
export class SongsModule {}
