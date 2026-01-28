import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SharedModule } from 'src/shared/shared.module';

// Infrastructure
import { OrderRepository } from './infrastructure/repositories/order.repository';

// Command Handlers
import { CreateOrderCommandHandler } from './application/use-cases/create-order';
import { AddItemToOrderCommandHandler } from './application/use-cases/add-item-to-order';
import { RemoveItemFromOrderCommandHandler } from './application/use-cases/remove-item-from-order';
import { ChangeItemQuantityCommandHandler } from './application/use-cases/change-item-quantity';
import { ConfirmOrderCommandHandler } from './application/use-cases/confirm-order';
import { ShipOrderCommandHandler } from './application/use-cases/ship-order';
import { DeliverOrderCommandHandler } from './application/use-cases/deliver-order';
import { CancelOrderCommandHandler } from './application/use-cases/cancel-order';

// Services
import { CreateOrderService } from './application/use-cases/create-order';
import { AddItemToOrderService } from './application/use-cases/add-item-to-order';
import { RemoveItemFromOrderService } from './application/use-cases/remove-item-from-order';
import { ChangeItemQuantityService } from './application/use-cases/change-item-quantity';
import { ConfirmOrderService } from './application/use-cases/confirm-order';
import { ShipOrderService } from './application/use-cases/ship-order';
import { DeliverOrderService } from './application/use-cases/deliver-order';
import { CancelOrderService } from './application/use-cases/cancel-order';

// Query Handlers
import { GetOrderQueryHandler } from './application/queries/get-order';
import { GetOrdersQueryHandler } from './application/queries/get-orders';

// Event Handlers
import {
  OrderCreatedEventHandler,
  OrderConfirmedEventHandler,
  OrderItemAddedEventHandler,
  OrderShippedEventHandler,
  OrderCancelledEventHandler,
} from './application/events';

// Sagas
import { OrderSaga } from './application/sagas';

// Controllers
import { OrdersController } from './presentation/orders.controller';

const CommandHandlers = [
  CreateOrderCommandHandler,
  AddItemToOrderCommandHandler,
  RemoveItemFromOrderCommandHandler,
  ChangeItemQuantityCommandHandler,
  ConfirmOrderCommandHandler,
  ShipOrderCommandHandler,
  DeliverOrderCommandHandler,
  CancelOrderCommandHandler,
];

const Services = [
  CreateOrderService,
  AddItemToOrderService,
  RemoveItemFromOrderService,
  ChangeItemQuantityService,
  ConfirmOrderService,
  ShipOrderService,
  DeliverOrderService,
  CancelOrderService,
];

const QueryHandlers = [GetOrderQueryHandler, GetOrdersQueryHandler];

const EventHandlers = [
  OrderCreatedEventHandler,
  OrderConfirmedEventHandler,
  OrderItemAddedEventHandler,
  OrderShippedEventHandler,
  OrderCancelledEventHandler,
];

const Sagas = [OrderSaga];

@Module({
  imports: [CqrsModule, SharedModule],
  controllers: [OrdersController],
  providers: [
    OrderRepository,
    ...CommandHandlers,
    ...Services,
    ...QueryHandlers,
    ...EventHandlers,
    ...Sagas,
  ],
  exports: [...Services],
})
export class OrdersModule {}
