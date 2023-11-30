import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { DddModule } from '@nestjslatam/ddd-lib';
import { CqrsModule } from '@nestjs/cqrs';

import { SingerRepository } from './infrastructure/db';
import { SingerTable } from '../database/tables';

import {
  singerCommandHandlers,
  singerControllers,
  singerDomainEventHandlers,
} from './application/use-cases';
import { SystemSagas } from './application/sagas';

@Module({
  imports: [TypeOrmModule.forFeature([SingerTable]), CqrsModule, DddModule],
  controllers: [...singerControllers],
  providers: [
    ...singerCommandHandlers,
    ...singerDomainEventHandlers,
    SystemSagas,
    SingerRepository,
  ],
})
export class SingersModule {}
