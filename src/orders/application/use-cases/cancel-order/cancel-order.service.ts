import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CancelOrderDto } from './cancel-order.dto';
import { CancelOrderCommand } from './cancel-order.command';

@Injectable()
export class CancelOrderService {
  constructor(private readonly commandBus: CommandBus) {}

  async execute(dto: CancelOrderDto): Promise<void> {
    const command = new CancelOrderCommand(dto);
    await this.commandBus.execute(command);
  }
}
