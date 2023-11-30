import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DevtoolsModule } from '@nestjs/devtools-integration';

import { SharedModule } from './shared/shared.module';
import { DatabaseModule } from './database/database.module';
import { SingersModule } from './singers/singers.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DevtoolsModule.register({
      http: process.env.NODE_ENV !== 'production',
    }),
    SharedModule,
    DatabaseModule,
    SingersModule,
  ],
})
export class AppModule {}
