import { ChangeItemQuantityDto } from './change-item-quantity.dto';

export class ChangeItemQuantityCommand {
  public readonly orderId: string;
  public readonly productId: string;
  public readonly newQuantity: number;

  constructor(dto: ChangeItemQuantityDto) {
    this.orderId = dto.orderId;
    this.productId = dto.productId;
    this.newQuantity = dto.newQuantity;
  }
}
