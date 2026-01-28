import { ChangeProductStatusDto } from './change-product-status.dto';

export class ChangeProductStatusCommand {
  public readonly productId: string;
  public readonly status: string;

  constructor(productId: string, dto: ChangeProductStatusDto) {
    this.productId = productId;
    this.status = dto.status;
  }
}

