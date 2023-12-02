import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { SharedModule } from './shared/shared.module';
import { DatabaseModule } from './database/database.module';
import { SingersModule } from './singers/singers.module';
import {
  MetaRequestContextInterceptor,
  MetaRequestContextService,
} from './shared';
import { RequestContextModule } from 'nestjs-request-context';

const requestContextInterceptors = [
  {
    provide: APP_INTERCEPTOR,
    useClass: MetaRequestContextInterceptor,
  },
];

@Module({
  imports: [
    ConfigModule.forRoot(),
    DevtoolsModule.register({
      http: process.env.NODE_ENV !== 'production',
    }),
    RequestContextModule,
    SharedModule,
    DatabaseModule,
    SingersModule,
  ],
  providers: [...requestContextInterceptors, MetaRequestContextService],
})
export class AppModule {}
