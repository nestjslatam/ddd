import { RemoveItemFromOrderDto } from './remove-item-from-order.dto';

export class RemoveItemFromOrderCommand {
  public readonly orderId: string;
  public readonly productId: string;

  constructor(dto: RemoveItemFromOrderDto) {
    this.orderId = dto.orderId;
    this.productId = dto.productId;
  }
}
