import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';

import { RequestContextModule } from 'nestjs-request-context';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { SharedModule } from './shared/shared.module';
import { DddModule } from '@nestjslatam/ddd-lib';

@Module({
  imports: [
    ConfigModule.forRoot(),
    CqrsModule.forRoot(),
    DddModule,
    RequestContextModule,
    ProductsModule,
    OrdersModule,
    SharedModule,
  ],
  providers: [],
})
export class AppModule {}
