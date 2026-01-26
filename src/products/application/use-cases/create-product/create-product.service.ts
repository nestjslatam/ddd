import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreateProductDto } from './create-product-dto';
import { CreateProductCommand } from './create-product.command';

@Injectable()
export class CreateProductService {
  constructor(private readonly commandBus: CommandBus) {}

  async execute(dto: CreateProductDto) {
    const command = new CreateProductCommand(dto);
    await this.commandBus.execute(command);
  }
}
