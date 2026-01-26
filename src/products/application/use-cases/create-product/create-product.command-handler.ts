import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { CreateProductCommand } from './create-product.command';
import { Description, Name, Price } from 'src/shared/valueobjects';
import { Product } from 'src/products/domain/product-aggregate/product';

@CommandHandler(CreateProductCommand)
export class CreateProductCommandHandler
  implements ICommandHandler<CreateProductCommand, void>
{
  constructor(private readonly publisher: EventPublisher) {}

  async execute(command: CreateProductCommand): Promise<void> {
    const { name, description, price } = command;

    const product = Product.create(
      Name.create(name),
      Description.create(description),
      Price.create(price),
    );

    if (!product.isValid()) {
      const errors = product.BrokenRules.getBrokenRules();
      throw new Error(errors.map((error) => error.message).join(', '));
    }

    const productMerged = this.publisher.mergeObjectContext(product);

    productMerged.commit();
  }
}
