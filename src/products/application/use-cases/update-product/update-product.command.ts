import { UpdateProductDto } from './update-product.dto';

export class UpdateProductCommand {
  public readonly productId: string;
  public readonly name?: string;
  public readonly description?: string;
  public readonly price?: number;

  constructor(productId: string, dto: UpdateProductDto) {
    this.productId = productId;
    this.name = dto.name;
    this.description = dto.description;
    this.price = dto.price;
  }
}
