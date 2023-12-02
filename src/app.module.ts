import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { SharedModule } from './shared/shared.module';
import { DatabaseModule } from './database/database.module';
import { SingersModule } from './singers/singers.module';
import { MetaRequestContextInterceptor } from './shared';

const interceptors = [
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
    SharedModule,
    DatabaseModule,
    SingersModule,
  ],
  providers: [...interceptors],
})
export class AppModule {}
