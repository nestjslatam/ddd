import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { ChangeProductStatusCommand } from './change-product-status.command';
import { ProductRepository } from 'src/products/infrastructure/repositories/product.repository';
import { NotFoundException } from '@nestjs/common';
import { ProductStatus } from 'src/products/domain/product-aggregate/product.status';
import { BrokenRulesException } from 'src/shared/exceptions/broken-rules.exception';
import { InvalidFormatException } from '@nestjslatam/ddd-lib';

@CommandHandler(ChangeProductStatusCommand)
export class ChangeProductStatusCommandHandler implements ICommandHandler<
  ChangeProductStatusCommand,
  void
> {
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

    // ProductStatus is a DddEnum: its static members are ProductStatus
    // INSTANCES, not strings. `Object.values(ProductStatus).includes(status)`
    // compared instances against a string and so never matched -- every call
    // was rejected, including with a valid name, producing the self-
    // contradicting "Expected: ACTIVE, INACTIVE or DELETED. Provided value:
    // 'INACTIVE'". The enum's own lookup is what this needed all along.
    //
    // It also passed the raw string on to ChangeStatus, which expects the
    // instance, so the aggregate would have received a string even had the
    // check passed.
    const productStatus =
      ProductStatus.fromNameIgnoreCase<ProductStatus>(status);

    if (!productStatus) {
      throw new InvalidFormatException(
        'status',
        ProductStatus.getAll<ProductStatus>()
          .map((candidate) => candidate.name)
          .join(', '),
        status,
      );
    }

    product.ChangeStatus(productStatus);

    if (!product.isValid) {
      const errors = product.brokenRules.getBrokenRules();
      throw new BrokenRulesException('Product', errors);
    }

    await this.productRepository.save(product);

    const productMerged = this.publisher.mergeObjectContext(product);
    productMerged.commit();
  }
}
