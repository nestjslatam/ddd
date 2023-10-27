import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

import { SingerService } from './application/singer.service';
import { SingerController } from './application/singer.controller';
import { SingerRepository } from './infrastructure/db';
import { SingerTable, SongTable } from '../database/tables';

@Module({
  imports: [TypeOrmModule.forFeature([SingerTable, SongTable])],
  controllers: [SingerController],
  providers: [SingerService, SingerRepository],
})
export class SingersModule {}
