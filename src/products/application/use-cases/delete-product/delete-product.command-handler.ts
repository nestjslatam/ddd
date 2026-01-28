import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteProductCommand } from './delete-product.command';
import { ProductRepository } from 'src/products/infrastructure/repositories/product.repository';
import { NotFoundException } from '@nestjs/common';

@CommandHandler(DeleteProductCommand)
export class DeleteProductCommandHandler
  implements ICommandHandler<DeleteProductCommand, void>
{
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(command: DeleteProductCommand): Promise<void> {
    const { productId } = command;

    const exists = await this.productRepository.exists(productId);
    if (!exists) {
      throw new NotFoundException(`Product with id ${productId} not found`);
    }

    await this.productRepository.delete(productId);
  }
}
