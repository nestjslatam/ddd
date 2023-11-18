import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { SharedModule } from './shared/shared.module';
import { DatabaseModule } from './database/database.module';
import { SingersModule } from './singers/singers.module';

import { DddModule } from './../libs/ddd/src/ddd.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DddModule,
    SharedModule,
    DatabaseModule,
    SingersModule,
  ],
})
export class AppModule {}
