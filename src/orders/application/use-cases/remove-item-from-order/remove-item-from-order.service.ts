import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { RemoveItemFromOrderDto } from './remove-item-from-order.dto';
import { RemoveItemFromOrderCommand } from './remove-item-from-order.command';

@Injectable()
export class RemoveItemFromOrderService {
  constructor(private readonly commandBus: CommandBus) {}

  async execute(dto: RemoveItemFromOrderDto): Promise<void> {
    const command = new RemoveItemFromOrderCommand(dto);
    await this.commandBus.execute(command);
  }
}
