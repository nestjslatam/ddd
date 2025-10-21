import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { DddModule } from '@nestjslatam/ddd-lib';
import { CqrsModule } from '@nestjs/cqrs';

import { SingerTable, SongTable, singerRepository } from './infrastructure/db';
import {
  singerCommandHandlers,
  singerControllers,
  singerDomainEventHandlers,
  singerQueryControllers,
  singerQueryHandlers,
} from './application/use-cases';
import { SystemSagas } from './application/sagas';
import { singerMappers } from './infrastructure';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([SingerTable, SongTable]),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db/ddd.sql',
      synchronize: true,
      entities: [SingerTable, SongTable],
    }),
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
