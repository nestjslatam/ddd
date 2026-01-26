import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import { CqrsModule } from '@nestjs/cqrs';

import { RequestContextModule } from 'nestjs-request-context';
import { ProductsModule } from './products/products.module';
import { SharedModule } from './shared/shared.module';
import { DddModule } from '@nestjslatam/ddd-lib/ddd.module';


@Module({
  imports: [
    ConfigModule.forRoot(),
    CqrsModule.forRoot(),
    DddModule,
    DevtoolsModule.register({
      http:
        process.env.NODE_ENV !== 'production' &&
        process.env.NODE_ENV !== 'test',
    }),
    RequestContextModule,
    ProductsModule,
    SharedModule,
  ],
  providers: [],
})
export class AppModule {}
