import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { CancelOrderCommand } from './cancel-order.command';
import { OrderRepository } from 'src/orders/infrastructure/repositories/order.repository';
import { NotFoundException } from '@nestjs/common';
import { BrokenRulesException } from 'src/shared/exceptions/broken-rules.exception';

@CommandHandler(CancelOrderCommand)
export class CancelOrderCommandHandler implements ICommandHandler<
  CancelOrderCommand,
  void
> {
  constructor(
    private readonly publisher: EventPublisher,
    private readonly orderRepository: OrderRepository,
  ) {}

  async execute(command: CancelOrderCommand): Promise<void> {
    const { orderId, reason } = command;

    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundException(`Order with id ${orderId} not found`);
    }

    order.cancel(reason);

    if (!order.isValid) {
      const errors = order.brokenRules.getBrokenRules();
      throw new BrokenRulesException('Order', errors);
    }

    await this.orderRepository.save(order);

    const orderMerged = this.publisher.mergeObjectContext(order);
    orderMerged.commit();
  }
}
