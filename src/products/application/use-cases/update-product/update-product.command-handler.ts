import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { UpdateProductCommand } from './update-product.command';
import { ProductRepository } from 'src/products/infrastructure/repositories/product.repository';
import { NotFoundException } from '@nestjs/common';
import { Name, Description, Price } from 'src/shared/valueobjects';

@CommandHandler(UpdateProductCommand)
export class UpdateProductCommandHandler
  implements ICommandHandler<UpdateProductCommand, void>
{
  constructor(
    private readonly publisher: EventPublisher,
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(command: UpdateProductCommand): Promise<void> {
    const { productId, name, description, price } = command;

    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new NotFoundException(`Product with id ${productId} not found`);
    }

    if (name) {
      product.ChangeName(Name.create(name));
    }

    if (description) {
      product.ChangeDescription(Description.create(description));
    }

    if (price) {
      product.ChangePrice(Price.create(price));
    }

    if (!product.isValid()) {
      const errors = product.brokenRules.getBrokenRules();
      throw new Error(errors.map((error) => error.message).join(', '));
    }

    await this.productRepository.save(product);

    const productMerged = this.publisher.mergeObjectContext(product);
    productMerged.commit();
  }
}

