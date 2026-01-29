import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ChangeItemQuantityDto } from './change-item-quantity.dto';
import { ChangeItemQuantityCommand } from './change-item-quantity.command';

@Injectable()
export class ChangeItemQuantityService {
  constructor(private readonly commandBus: CommandBus) {}

  async execute(dto: ChangeItemQuantityDto): Promise<void> {
    const command = new ChangeItemQuantityCommand(dto);
    await this.commandBus.execute(command);
  }
}
