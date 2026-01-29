import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { ShipOrderCommand } from './ship-order.command';
import { OrderRepository } from 'src/orders/infrastructure/repositories/order.repository';
import { NotFoundException } from '@nestjs/common';

@CommandHandler(ShipOrderCommand)
export class ShipOrderCommandHandler
  implements ICommandHandler<ShipOrderCommand, void>
{
  constructor(
    private readonly publisher: EventPublisher,
    private readonly orderRepository: OrderRepository,
  ) {}

  async execute(command: ShipOrderCommand): Promise<void> {
    const { orderId, trackingNumber } = command;

    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundException(`Order with id ${orderId} not found`);
    }

    order.ship(trackingNumber);

    if (!order.isValid()) {
      const errors = order.brokenRules.getBrokenRules();
      throw new Error(errors.map((error) => error.message).join(', '));
    }

    await this.orderRepository.save(order);

    const orderMerged = this.publisher.mergeObjectContext(order);
    orderMerged.commit();
  }
}
