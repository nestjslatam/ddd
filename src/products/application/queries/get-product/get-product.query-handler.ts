import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetProductQuery } from './get-product.query';
import { ProductResponse } from '../dtos/product-response.dto';
import { ProductRepository } from 'src/products/infrastructure/repositories/product.repository';
import { NotFoundException } from '@nestjs/common';

@QueryHandler(GetProductQuery)
export class GetProductQueryHandler implements IQueryHandler<GetProductQuery> {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(query: GetProductQuery): Promise<ProductResponse> {
    const product = await this.productRepository.findById(query.id);

    if (!product) {
      throw new NotFoundException(`Product with id ${query.id} not found`);
    }

    return {
      id: product.id.getValue(),
      name: product.props.name.getValue(),
      description: product.props.description.getValue(),
      price: product.props.price.getValue().toString(),
      status: product.props.status.toString(),
    };
  }
}

