import { IsNumber, IsString } from 'class-validator';

/**
 * The transport contract for POST /orders/:id/items.
 *
 * `orderId` is deliberately absent: it arrives as a path parameter, and a
 * body that could also carry it would let the two disagree.
 */
export class AddItemToOrderBodyDto {
  @IsString()
  productId: string;

  @IsString()
  productName: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  unitPrice: number;
}

/** The full command shape, once the controller has merged in the path id. */
export class AddItemToOrderDto extends AddItemToOrderBodyDto {
  orderId: string;
}
