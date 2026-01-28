import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ConfirmOrderDto } from './confirm-order.dto';
import { ConfirmOrderCommand } from './confirm-order.command';

@Injectable()
export class ConfirmOrderService {
  constructor(private readonly commandBus: CommandBus) {}

  async execute(dto: ConfirmOrderDto): Promise<void> {
    const command = new ConfirmOrderCommand(dto);
    await this.commandBus.execute(command);
  }
}

