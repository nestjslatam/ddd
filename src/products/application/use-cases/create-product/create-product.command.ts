import { CreateProductDto } from './create-product-dto';

export class CreateProductCommand {
  public readonly name: string;
  public readonly description: string;
  public readonly price: number;

  constructor(product: CreateProductDto) {
    this.name = product.name;
    this.description = product.description;
    this.price = product.price;
  }
}
