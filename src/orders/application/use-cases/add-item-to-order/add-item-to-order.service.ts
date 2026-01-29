import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { AddItemToOrderDto } from './add-item-to-order.dto';
import { AddItemToOrderCommand } from './add-item-to-order.command';

@Injectable()
export class AddItemToOrderService {
  constructor(private readonly commandBus: CommandBus) {}

  async execute(dto: AddItemToOrderDto): Promise<void> {
    const command = new AddItemToOrderCommand(dto);
    await this.commandBus.execute(command);
  }
}
