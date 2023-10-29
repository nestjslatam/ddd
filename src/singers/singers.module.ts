import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { RequestContextModule } from 'nestjs-request-context';

import { SingerService } from './application/singer.service';
import { SingerController } from './application/singer.controller';
import { SingerRepository } from './infrastructure/db';
import { SingerTable } from '../database/tables';

@Module({
  imports: [RequestContextModule, TypeOrmModule.forFeature([SingerTable])],
  controllers: [SingerController],
  providers: [SingerService, SingerRepository],
})
export class SingersModule {}
