import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DevtoolsModule } from '@nestjs/devtools-integration';

import { RequestContextModule } from 'nestjs-request-context';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DevtoolsModule.register({
      http:
        process.env.NODE_ENV !== 'production' &&
        process.env.NODE_ENV !== 'test',
    }),
    RequestContextModule,
  ],
  providers: [],
})
export class AppModule {}
