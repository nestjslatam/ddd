import { Injectable, Logger } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { Observable, delay, map } from 'rxjs';
import { ProductCreatedEvent } from 'src/products/domain/product-aggregate/events/ProductCreatedEvent';
import { ProductPriceChangedEvent } from 'src/products/domain/product-aggregate/events/ProductPriceChangedEvent';
import { ProductStatusChangedEvent } from 'src/products/domain/product-aggregate/events/ProductStatusChanged';

/**
 * Product Saga
 * Orquesta procesos complejos basados en eventos de dominio
 */
@Injectable()
export class ProductSaga {
  private readonly logger = new Logger(ProductSaga.name);

  /**
   * Saga: Cuando se crea un producto, indexar para búsqueda
   */
  @Saga()
  productCreated = (events$: Observable<any>): Observable<ICommand> => {
    return events$.pipe(
      ofType(ProductCreatedEvent),
      delay(1000),
      map((event) => {
        this.logger.log(
          `[SAGA] Product created: ${event.productId} - Indexing for search`,
        );
        // Aquí dispararíamos un IndexProductCommand
        // return new IndexProductCommand(event.aggregateId);
        return null as any;
      }),
    );
  };

  /**
   * Saga: Cuando cambia el precio, notificar a usuarios interesados
   */
  @Saga()
  productPriceChanged = (events$: Observable<any>): Observable<ICommand> => {
    return events$.pipe(
      ofType(ProductPriceChangedEvent),
      delay(1000),
      map((event) => {
        this.logger.log(
          `[SAGA] Price changed for product: ${event.productId} - Notifying watchers`,
        );
        // Aquí dispararíamos un NotifyPriceWatchersCommand
        // return new NotifyPriceWatchersCommand(event.productId, event.productPrice);
        return null as any;
      }),
    );
  };

  /**
   * Saga: Cuando se inactiva un producto, cancelar órdenes pendientes
   */
  @Saga()
  productStatusChanged = (events$: Observable<any>): Observable<ICommand> => {
    return events$.pipe(
      ofType(ProductStatusChangedEvent),
      delay(1000),
      map((event) => {
        if (event.productStatus === 'INACTIVE') {
          this.logger.log(
            `[SAGA] Product deactivated: ${event.productId} - Checking pending orders`,
          );
          // Aquí dispararíamos un CancelPendingOrdersCommand
          // return new CancelPendingOrdersCommand(event.productId);
        }
        return null as any;
      }),
    );
  };
}

