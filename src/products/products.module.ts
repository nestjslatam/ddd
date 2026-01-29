import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SharedModule } from 'src/shared/shared.module';

// Infrastructure
import { ProductRepository } from './infrastructure/repositories/product.repository';

// Command Handlers
import { CreateProductCommandHandler } from './application/use-cases/create-product';
import { UpdateProductCommandHandler } from './application/use-cases/update-product';
import { ChangeProductStatusCommandHandler } from './application/use-cases/change-product-status';
import { DeleteProductCommandHandler } from './application/use-cases/delete-product';

// Services
import { CreateProductService } from './application/use-cases/create-product';
import { UpdateProductService } from './application/use-cases/update-product';
import { ChangeProductStatusService } from './application/use-cases/change-product-status';
import { DeleteProductService } from './application/use-cases/delete-product';

// Query Handlers
import { GetProductQueryHandler } from './application/queries/get-product';
import { GetProductsQueryHandler } from './application/queries/get-products';

// Event Handlers
import {
  ProductCreatedEventHandler,
  ProductPriceChangedEventHandler,
  ProductStatusChangedEventHandler,
} from './application/events';

// Sagas
import { ProductSaga } from './application/sagas';

// Controllers
import { ProductsController } from './presentation/products.controller';

const CommandHandlers = [
  CreateProductCommandHandler,
  UpdateProductCommandHandler,
  ChangeProductStatusCommandHandler,
  DeleteProductCommandHandler,
];

const Services = [
  CreateProductService,
  UpdateProductService,
  ChangeProductStatusService,
  DeleteProductService,
];

const QueryHandlers = [GetProductQueryHandler, GetProductsQueryHandler];

const EventHandlers = [
  ProductCreatedEventHandler,
  ProductPriceChangedEventHandler,
  ProductStatusChangedEventHandler,
];

const Sagas = [ProductSaga];

@Module({
  imports: [CqrsModule, SharedModule],
  controllers: [ProductsController],
  providers: [
    ProductRepository,
    ...CommandHandlers,
    ...Services,
    ...QueryHandlers,
    ...EventHandlers,
    ...Sagas,
  ],
  exports: [...Services],
})
export class ProductsModule {}
