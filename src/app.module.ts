import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import { DddModule } from '@nestjslatam/ddd-lib';

import { SharedModule } from './shared/shared.module';
import { DatabaseModule } from './database/database.module';
import { SingersModule } from './singers/singers.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DevtoolsModule.register({
      http: process.env.NODE_ENV !== 'production',
    }),
    DddModule,
    SharedModule,
    DatabaseModule,
    SingersModule,
  ],
})
export class AppModule {}
