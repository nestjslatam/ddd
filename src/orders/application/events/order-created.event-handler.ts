import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { OrderCreatedEvent } from 'src/orders/domain/events/order.events';
import { Logger } from '@nestjs/common';

@EventsHandler(OrderCreatedEvent)
export class OrderCreatedEventHandler
  implements IEventHandler<OrderCreatedEvent>
{
  private readonly logger = new Logger(OrderCreatedEventHandler.name);

  async handle(event: OrderCreatedEvent) {
    this.logger.log(
      `[EVENT HANDLER] Order created: ${event.orderId} for customer ${event.customerId}`,
    );

    // Aquí podrías:
    // - Enviar notificaciones
    // - Actualizar proyecciones de lectura
    // - Integrar con servicios externos
    // - Generar reportes
  }
}
