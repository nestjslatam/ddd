import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { ChangeItemQuantityCommand } from './change-item-quantity.command';
import { IdValueObject } from '@nestjslatam/ddd-lib';
import { OrderRepository } from 'src/orders/infrastructure/repositories/order.repository';
import { NotFoundException } from '@nestjs/common';

@CommandHandler(ChangeItemQuantityCommand)
export class ChangeItemQuantityCommandHandler
  implements ICommandHandler<ChangeItemQuantityCommand, void>
{
  constructor(
    private readonly publisher: EventPublisher,
    private readonly orderRepository: OrderRepository,
  ) {}

  async execute(command: ChangeItemQuantityCommand): Promise<void> {
    const { orderId, productId, newQuantity } = command;

    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundException(`Order with id ${orderId} not found`);
    }

    const productIdVO = IdValueObject.load(productId);
    order.changeItemQuantity(productIdVO, newQuantity);

    if (!order.isValid()) {
      const errors = order.brokenRules.getBrokenRules();
      throw new Error(errors.map((error) => error.message).join(', '));
    }

    await this.orderRepository.save(order);

    const orderMerged = this.publisher.mergeObjectContext(order);
    orderMerged.commit();
  }
}
