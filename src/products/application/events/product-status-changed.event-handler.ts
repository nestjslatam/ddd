import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ProductStatusChangedEvent } from 'src/products/domain/product-aggregate/events/ProductStatusChanged';
import { Logger } from '@nestjs/common';

@EventsHandler(ProductStatusChangedEvent)
export class ProductStatusChangedEventHandler
  implements IEventHandler<ProductStatusChangedEvent>
{
  private readonly logger = new Logger(ProductStatusChangedEventHandler.name);

  async handle(event: ProductStatusChangedEvent) {
    this.logger.log(
      `[EVENT HANDLER] Product status changed: ${event.productId} - New status: ${event.productStatus}`,
    );

    // Aquí podrías:
    // - Ocultar/mostrar producto en catálogo
    // - Notificar a administradores
    // - Actualizar disponibilidad
    // - Cancelar órdenes pendientes si se inactiva
  }
}

