import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { UpdateProductDto } from './update-product.dto';
import { UpdateProductCommand } from './update-product.command';

@Injectable()
export class UpdateProductService {
  constructor(private readonly commandBus: CommandBus) {}

  async execute(productId: string, dto: UpdateProductDto): Promise<void> {
    const command = new UpdateProductCommand(productId, dto);
    await this.commandBus.execute(command);
  }
}
