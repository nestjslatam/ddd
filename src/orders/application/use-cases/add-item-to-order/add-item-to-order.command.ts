import { AddItemToOrderDto } from './add-item-to-order.dto';

export class AddItemToOrderCommand {
  public readonly orderId: string;
  public readonly productId: string;
  public readonly productName: string;
  public readonly quantity: number;
  public readonly unitPrice: number;

  constructor(dto: AddItemToOrderDto) {
    this.orderId = dto.orderId;
    this.productId = dto.productId;
    this.productName = dto.productName;
    this.quantity = dto.quantity;
    this.unitPrice = dto.unitPrice;
  }
}

