import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { SingerTable, SongTable } from './tables';

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
  ],
})
export class DatabaseModule {}
