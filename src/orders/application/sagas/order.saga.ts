import { Injectable, Logger } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { Observable, delay, map } from 'rxjs';
import {
  OrderCreatedEvent,
  OrderConfirmedEvent,
  OrderShippedEvent,
} from 'src/orders/domain/events/order.events';

/**
 * Order Saga
 * Orquesta procesos complejos basados en eventos de dominio
 */
@Injectable()
export class OrderSaga {
  private readonly logger = new Logger(OrderSaga.name);

  /**
   * Saga: Cuando se crea una orden, enviar email de confirmación
   * En una implementación real, esto dispararía un comando de notificación
   */
  @Saga()
  orderCreated = (events$: Observable<any>): Observable<ICommand> => {
    return events$.pipe(
      ofType(OrderCreatedEvent),
      delay(1000),
      map((event) => {
        this.logger.log(
          `[SAGA] Order created: ${event.orderId} - Sending welcome email to customer ${event.customerId}`,
        );
        // Aquí dispararíamos un SendEmailCommand
        // return new SendEmailCommand(event.customerEmail, 'Order Created', ...);
        return null as any;
      }),
    );
  };

  /**
   * Saga: Cuando se confirma una orden, iniciar proceso de preparación
   */
  @Saga()
  orderConfirmed = (events$: Observable<any>): Observable<ICommand> => {
    return events$.pipe(
      ofType(OrderConfirmedEvent),
      delay(1000),
      map((event) => {
        this.logger.log(
          `[SAGA] Order confirmed: ${event.orderId} - Initiating preparation process`,
        );
        // Aquí dispararíamos un PrepareOrderCommand
        // return new PrepareOrderCommand(event.orderId);
        return null as any;
      }),
    );
  };

  /**
   * Saga: Cuando se envía una orden, notificar al cliente
   */
  @Saga()
  orderShipped = (events$: Observable<any>): Observable<ICommand> => {
    return events$.pipe(
      ofType(OrderShippedEvent),
      delay(1000),
      map((event) => {
        this.logger.log(
          `[SAGA] Order shipped: ${event.orderId} - Tracking: ${
            event.trackingNumber || 'N/A'
          }`,
        );
        // Aquí dispararíamos un SendShippingNotificationCommand
        // return new SendShippingNotificationCommand(event.orderId, event.trackingNumber);
        return null as any;
      }),
    );
  };
}
