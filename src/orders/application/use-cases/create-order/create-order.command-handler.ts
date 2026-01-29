import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { CreateOrderCommand } from './create-order.command';
import { Order } from 'src/orders/domain/order-aggregate/order';
import { CustomerInfo } from 'src/orders/domain/value-objects/customer-info.vo';
import { ShippingAddress } from 'src/orders/domain/value-objects/shipping-address.vo';
import { OrderRepository } from 'src/orders/infrastructure/repositories/order.repository';

@CommandHandler(CreateOrderCommand)
export class CreateOrderCommandHandler
  implements ICommandHandler<CreateOrderCommand, string>
{
  constructor(
    private readonly publisher: EventPublisher,
    private readonly orderRepository: OrderRepository,
  ) {}

  async execute(command: CreateOrderCommand): Promise<string> {
    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingStreet,
      shippingComplement,
      shippingCity,
      shippingState,
      shippingZipCode,
      shippingCountry,
      currency,
    } = command;

    // Create value objects
    const customerInfo = CustomerInfo.create(
      customerName,
      customerEmail,
      customerPhone,
    );

    const shippingAddress = ShippingAddress.create(
      shippingStreet,
      shippingComplement,
      shippingCity,
      shippingState,
      shippingZipCode,
      shippingCountry,
    );

    // Create order aggregate
    const order = Order.create(customerInfo, shippingAddress, currency);

    if (!order.isValid()) {
      const errors = order.brokenRules.getBrokenRules();
      throw new Error(errors.map((error) => error.message).join(', '));
    }

    // Save order to repository
    await this.orderRepository.save(order);

    // Publish domain events
    const orderMerged = this.publisher.mergeObjectContext(order);
    orderMerged.commit();

    return order.id.getValue();
  }
}
