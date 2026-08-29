import { IsNumber } from 'class-validator';

/** The transport contract for PATCH /orders/:id/items/:productId. */
export class ChangeItemQuantityBodyDto {
  @IsNumber()
  newQuantity: number;
}

/** The full command shape, once the controller has merged in the path params. */
export class ChangeItemQuantityDto extends ChangeItemQuantityBodyDto {
  orderId: string;
  productId: string;
}
