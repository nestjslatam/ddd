import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { CreateProductCommand } from './create-product.command';
import { Description, Name, Price } from 'src/shared/valueobjects';
import { Product } from 'src/products/domain/product-aggregate/product';
import { ProductRepository } from 'src/products/infrastructure/repositories/product.repository';
import { BrokenRulesException } from 'src/shared/exceptions/broken-rules.exception';

@CommandHandler(CreateProductCommand)
export class CreateProductCommandHandler implements ICommandHandler<
  CreateProductCommand,
  string
> {
  constructor(
    private readonly publisher: EventPublisher,
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(command: CreateProductCommand): Promise<string> {
    const { name, description, price } = command;

    const product = Product.create(
      Name.create(name),
      Description.create(description),
      Price.create(price),
    );

    if (!product.isValid) {
      const errors = product.brokenRules.getBrokenRules();
      throw new BrokenRulesException('Product', errors);
    }

    await this.productRepository.save(product);

    const productMerged = this.publisher.mergeObjectContext(product);
    productMerged.commit();

    return product.id.getValue();
  }
}
