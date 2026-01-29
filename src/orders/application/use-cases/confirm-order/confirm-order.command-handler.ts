import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { ConfirmOrderCommand } from './confirm-order.command';
import { OrderRepository } from 'src/orders/infrastructure/repositories/order.repository';
import { NotFoundException } from '@nestjs/common';

@CommandHandler(ConfirmOrderCommand)
export class ConfirmOrderCommandHandler
  implements ICommandHandler<ConfirmOrderCommand, void>
{
  constructor(
    private readonly publisher: EventPublisher,
    private readonly orderRepository: OrderRepository,
  ) {}

  async execute(command: ConfirmOrderCommand): Promise<void> {
    const { orderId } = command;

    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundException(`Order with id ${orderId} not found`);
    }

    order.confirm();

    if (!order.isValid()) {
      const errors = order.brokenRules.getBrokenRules();
      throw new Error(errors.map((error) => error.message).join(', '));
    }

    await this.orderRepository.save(order);

    const orderMerged = this.publisher.mergeObjectContext(order);
    orderMerged.commit();
  }
}
