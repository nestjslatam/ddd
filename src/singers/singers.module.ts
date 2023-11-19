import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { DddModule } from '@nestjslatam/ddd-lib';

import { SingerRepository } from './infrastructure/db';
import { SingerTable } from '../database/tables';

import {
  singerCommandHandlers,
  singerControllers,
} from './application/use-cases';

@Module({
  imports: [TypeOrmModule.forFeature([SingerTable]), DddModule],
  controllers: [...singerControllers],
  providers: [...singerCommandHandlers, SingerRepository],
})
export class SingersModule {}
