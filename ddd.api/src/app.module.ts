import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DddModule } from '@nestjslatam/ddd';
import { DevtoolsModule } from '@nestjs/devtools-integration';

import { SharedModule } from './shared/shared.module';

import { DatabaseModule } from './database/database.module';
import { SongsModule } from './songs/songs.module';
import { SingersModule } from './singers/singers.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DddModule,
    DevtoolsModule.register({
      http: process.env.NODE_ENV !== 'production',
    }),
    SharedModule,
    DatabaseModule,
    SongsModule,
    SingersModule,
  ],
})
export class AppModule {}
