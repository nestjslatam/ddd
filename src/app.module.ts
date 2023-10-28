import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RequestContextModule } from 'nestjs-request-context';
import { DddModule } from '@nestjslatam/ddd-lib';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { SharedModule } from './shared/shared.module';
import { DatabaseModule } from './database/database.module';
import { SongsModule } from './songs/songs.module';
import { SingersModule } from './singers/singers.module';
import { ContextTrackingInterceptor } from './context';

const interceptors = [
  {
    provide: APP_INTERCEPTOR,
    useClass: ContextTrackingInterceptor,
  },
];

@Module({
  imports: [
    ConfigModule.forRoot(),
    RequestContextModule, // Important to get request context for each request
    DddModule,
    SharedModule,
    DatabaseModule,
    SongsModule,
    SingersModule,
  ],
  providers: [...interceptors],
})
export class AppModule {}
