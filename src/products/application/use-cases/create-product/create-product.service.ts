import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreateProductDto } from './create-product-dto';
import { CreateProductCommand } from './create-product.command';

@Injectable()
export class CreateProductService {
  constructor(private readonly commandBus: CommandBus) {}

  async execute(dto: CreateProductDto): Promise<string> {
    const command = new CreateProductCommand(dto);
    return await this.commandBus.execute<CreateProductCommand, string>(command);
  }
}
