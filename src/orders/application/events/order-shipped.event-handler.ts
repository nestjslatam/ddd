import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { OrderShippedEvent } from 'src/orders/domain/events/order.events';
import { Logger } from '@nestjs/common';

@EventsHandler(OrderShippedEvent)
export class OrderShippedEventHandler
  implements IEventHandler<OrderShippedEvent>
{
  private readonly logger = new Logger(OrderShippedEventHandler.name);

  async handle(event: OrderShippedEvent) {
    this.logger.log(
      `[EVENT HANDLER] Order shipped: ${event.orderId} - Tracking: ${
        event.trackingNumber || 'N/A'
      }`,
    );

    // Aquí podrías:
    // - Enviar tracking al cliente
    // - Notificar a logística
    // - Actualizar estado en sistemas externos
  }
}
