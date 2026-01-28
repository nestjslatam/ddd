import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ChangeProductStatusDto } from './change-product-status.dto';
import { ChangeProductStatusCommand } from './change-product-status.command';

@Injectable()
export class ChangeProductStatusService {
  constructor(private readonly commandBus: CommandBus) {}

  async execute(productId: string, dto: ChangeProductStatusDto): Promise<void> {
    const command = new ChangeProductStatusCommand(productId, dto);
    await this.commandBus.execute(command);
  }
}

