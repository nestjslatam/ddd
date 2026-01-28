import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { OrderConfirmedEvent } from 'src/orders/domain/events/order.events';
import { Logger } from '@nestjs/common';

@EventsHandler(OrderConfirmedEvent)
export class OrderConfirmedEventHandler
  implements IEventHandler<OrderConfirmedEvent>
{
  private readonly logger = new Logger(OrderConfirmedEventHandler.name);

  async handle(event: OrderConfirmedEvent) {
    this.logger.log(
      `[EVENT HANDLER] Order confirmed: ${event.orderId} - Total: ${event.totalAmount}`,
    );

    // Aquí podrías:
    // - Enviar confirmación al cliente
    // - Notificar al almacén
    // - Iniciar proceso de pago
    // - Actualizar inventario
  }
}
