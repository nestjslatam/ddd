import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { DeliverOrderDto } from './deliver-order.dto';
import { DeliverOrderCommand } from './deliver-order.command';

@Injectable()
export class DeliverOrderService {
  constructor(private readonly commandBus: CommandBus) {}

  async execute(dto: DeliverOrderDto): Promise<void> {
    const command = new DeliverOrderCommand(dto);
    await this.commandBus.execute(command);
  }
}

