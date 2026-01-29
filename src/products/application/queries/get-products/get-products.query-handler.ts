import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetProductsQuery } from './get-products.query';
import { ProductResponseDto } from '../dtos/product-response.dto';
import { ProductRepository } from '../../../infrastructure/repositories/product.repository';
import { ProductStatus } from '../../../domain/product-aggregate/product.status';

@QueryHandler(GetProductsQuery)
export class GetProductsQueryHandler
  implements IQueryHandler<GetProductsQuery>
{
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(query: GetProductsQuery): Promise<ProductResponseDto[]> {
    let products = await this.productRepository.findAll();

    // Filter by status if provided
    if (query.status) {
      products = products.filter(
        (product) =>
          product.props.status === (query.status as unknown as ProductStatus),
      );
    }

    // Apply pagination
    const paginatedProducts = products.slice(
      query.offset,
      query.offset + query.limit,
    );

    return paginatedProducts.map((product) => ({
      id: product.id.getValue(),
      name: product.props.name.getValue(),
      description: product.props.description.getValue(),
      price: product.props.price.getValue().toString(),
      status: product.props.status.toString(),
    }));
  }
}
