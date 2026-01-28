import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreateOrderDto } from './create-order.dto';
import { CreateOrderCommand } from './create-order.command';

@Injectable()
export class CreateOrderService {
  constructor(private readonly commandBus: CommandBus) {}

  async execute(dto: CreateOrderDto): Promise<string> {
    const command = new CreateOrderCommand(dto);
    return await this.commandBus.execute<CreateOrderCommand, string>(command);
  }
}
