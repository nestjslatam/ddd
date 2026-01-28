import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { OrderItemAddedEvent } from 'src/orders/domain/events/order.events';
import { Logger } from '@nestjs/common';

@EventsHandler(OrderItemAddedEvent)
export class OrderItemAddedEventHandler
  implements IEventHandler<OrderItemAddedEvent>
{
  private readonly logger = new Logger(OrderItemAddedEventHandler.name);

  async handle(event: OrderItemAddedEvent) {
    this.logger.log(
      `[EVENT HANDLER] Item added to order ${event.orderId}: ${event.productName} x${event.quantity}`,
    );

    // Aquí podrías:
    // - Actualizar vistas de lectura
    // - Verificar disponibilidad de inventario
    // - Recalcular totales en proyecciones
  }
}

