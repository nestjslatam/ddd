import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { DeleteProductCommand } from './delete-product.command';

@Injectable()
export class DeleteProductService {
  constructor(private readonly commandBus: CommandBus) {}

  async execute(productId: string): Promise<void> {
    const command = new DeleteProductCommand(productId);
    await this.commandBus.execute(command);
  }
}
