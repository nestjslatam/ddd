import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { AddItemToOrderCommand } from './add-item-to-order.command';
import { IdValueObject } from '@nestjslatam/ddd-lib';
import { Money } from 'src/orders/domain/value-objects/money.vo';
import { OrderRepository } from 'src/orders/infrastructure/repositories/order.repository';
import { NotFoundException } from '@nestjs/common';
import { BrokenRulesException } from 'src/shared/exceptions/broken-rules.exception';

@CommandHandler(AddItemToOrderCommand)
export class AddItemToOrderCommandHandler implements ICommandHandler<
  AddItemToOrderCommand,
  void
> {
  constructor(
    private readonly publisher: EventPublisher,
    private readonly orderRepository: OrderRepository,
  ) {}

  async execute(command: AddItemToOrderCommand): Promise<void> {
    const { orderId, productId, productName, quantity, unitPrice } = command;

    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundException(`Order with id ${orderId} not found`);
    }

    const productIdVO = IdValueObject.load(productId);
    const price = Money.fromAmount(unitPrice);

    order.addItem(productIdVO, productName, quantity, price);

    if (!order.isValid) {
      const errors = order.brokenRules.getBrokenRules();
      throw new BrokenRulesException('Order', errors);
    }

    await this.orderRepository.save(order);

    const orderMerged = this.publisher.mergeObjectContext(order);
    orderMerged.commit();
  }
}
