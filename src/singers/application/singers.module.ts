import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { DddModule } from '@nestjslatam/ddd-lib';
import { CqrsModule } from '@nestjs/cqrs';

import { singerRepository } from './infrastructure/db';
import { SingerTable, SongTable } from '../database/tables';
import {
  singerCommandHandlers,
  singerControllers,
  singerDomainEventHandlers,
  singerQueryControllers,
  singerQueryHandlers,
} from './application/use-cases';
import { SystemSagas } from './application/sagas';
import { singerMappers } from './application/mappers';

@Module({
  imports: [
    TypeOrmModule.forFeature([SingerTable, SongTable]),
    CqrsModule,
    DddModule,
  ],
  controllers: [...singerControllers, ...singerQueryControllers],
  providers: [
    ...singerCommandHandlers,
    ...singerDomainEventHandlers,
    ...singerMappers,
    ...singerRepository,
    ...singerQueryHandlers,
    SystemSagas,
  ],
})
export class SingersModule {}
