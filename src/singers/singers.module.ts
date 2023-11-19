import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { DddModule } from '@nestjslatam/ddd-lib';

import { SingerRepository } from './infrastructure/db';
import { SingerTable } from '../database/tables';

import {
  singerCommandHandlers,
  singerControllers,
  singerDomainEventHandlers,
} from './application/use-cases';

@Module({
  imports: [TypeOrmModule.forFeature([SingerTable]), DddModule],
  controllers: [...singerControllers],
  providers: [
    ...singerCommandHandlers,
    ...singerDomainEventHandlers,
    SingerRepository,
  ],
})
export class SingersModule {}
