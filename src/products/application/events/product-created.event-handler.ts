import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ProductCreatedEvent } from 'src/products/domain/product-aggregate/events/ProductCreatedEvent';
import { Logger } from '@nestjs/common';

@EventsHandler(ProductCreatedEvent)
export class ProductCreatedEventHandler
  implements IEventHandler<ProductCreatedEvent>
{
  private readonly logger = new Logger(ProductCreatedEventHandler.name);

  async handle(event: ProductCreatedEvent) {
    this.logger.log(
      `[EVENT HANDLER] Product created: ${event.productId} - ${event.productName}`,
    );

    // Aquí podrías:
    // - Actualizar índices de búsqueda
    // - Enviar notificaciones
    // - Actualizar caché
    // - Integrar con sistemas externos
  }
}

