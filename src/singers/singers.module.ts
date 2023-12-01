import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { DddModule } from '@nestjslatam/ddd-lib';
import { CqrsModule } from '@nestjs/cqrs';
import { AutomapperModule } from '@automapper/nestjs';
import { classes } from '@automapper/classes';

import { SingerRepository } from './infrastructure/db';
import { SingerTable } from '../database/tables';
import {
  singerCommandHandlers,
  singerControllers,
  singerDomainEventHandlers,
} from './application/use-cases';
import { SystemSagas } from './application/sagas';
import { singerMappers } from './application/mappers';

@Module({
  imports: [
    TypeOrmModule.forFeature([SingerTable]),
    AutomapperModule.forRoot({
      strategyInitializer: classes(),
    }),
    CqrsModule,
    DddModule,
  ],
  controllers: [...singerControllers],
  providers: [
    ...singerCommandHandlers,
    ...singerDomainEventHandlers,
    ...singerMappers,
    SystemSagas,
    SingerRepository,
  ],
})
export class SingersModule {}
