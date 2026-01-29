import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ProductPriceChangedEvent } from 'src/products/domain/product-aggregate/events/ProductPriceChangedEvent';
import { Logger } from '@nestjs/common';

@EventsHandler(ProductPriceChangedEvent)
export class ProductPriceChangedEventHandler
  implements IEventHandler<ProductPriceChangedEvent>
{
  private readonly logger = new Logger(ProductPriceChangedEventHandler.name);

  async handle(event: ProductPriceChangedEvent) {
    this.logger.log(
      `[EVENT HANDLER] Product price changed: ${event.productId} - New price: ${event.productPrice}`,
    );

    // Aquí podrías:
    // - Notificar a usuarios que siguen el producto
    // - Actualizar precios en carrito de compras
    // - Registrar historial de precios
    // - Actualizar reportes
  }
}
