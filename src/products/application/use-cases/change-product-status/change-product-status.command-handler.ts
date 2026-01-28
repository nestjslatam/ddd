import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { ChangeProductStatusCommand } from './change-product-status.command';
import { ProductRepository } from 'src/products/infrastructure/repositories/product.repository';
import { NotFoundException } from '@nestjs/common';
import { ProductStatus } from 'src/products/domain/product-aggregate/product.status';

@CommandHandler(ChangeProductStatusCommand)
export class ChangeProductStatusCommandHandler
  implements ICommandHandler<ChangeProductStatusCommand, void>
{
  constructor(
    private readonly publisher: EventPublisher,
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(command: ChangeProductStatusCommand): Promise<void> {
    const { productId, status } = command;

    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new NotFoundException(`Product with id ${productId} not found`);
    }

    const productStatus = status.toUpperCase();
    if (!Object.values(ProductStatus).includes(productStatus as any)) {
      throw new Error(`Invalid status: ${status}`);
    }

    product.ChangeStatus(productStatus as unknown as ProductStatus);

    if (!product.isValid()) {
      const errors = product.brokenRules.getBrokenRules();
      throw new Error(errors.map((error) => error.message).join(', '));
    }

    await this.productRepository.save(product);

    const productMerged = this.publisher.mergeObjectContext(product);
    productMerged.commit();
  }
}

