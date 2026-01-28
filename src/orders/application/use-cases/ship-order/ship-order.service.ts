import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ShipOrderDto } from './ship-order.dto';
import { ShipOrderCommand } from './ship-order.command';

@Injectable()
export class ShipOrderService {
  constructor(private readonly commandBus: CommandBus) {}

  async execute(dto: ShipOrderDto): Promise<void> {
    const command = new ShipOrderCommand(dto);
    await this.commandBus.execute(command);
  }
}

