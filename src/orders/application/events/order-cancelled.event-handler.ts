import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { OrderCancelledEvent } from 'src/orders/domain/events/order.events';
import { Logger } from '@nestjs/common';

@EventsHandler(OrderCancelledEvent)
export class OrderCancelledEventHandler
  implements IEventHandler<OrderCancelledEvent>
{
  private readonly logger = new Logger(OrderCancelledEventHandler.name);

  async handle(event: OrderCancelledEvent) {
    this.logger.log(
      `[EVENT HANDLER] Order cancelled: ${event.orderId} - Reason: ${event.reason}`,
    );

    // Aquí podrías:
    // - Enviar notificación de cancelación
    // - Reembolsar pago
    // - Liberar inventario
    // - Actualizar métricas
  }
}

