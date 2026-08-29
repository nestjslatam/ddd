import { IsString } from 'class-validator';

/** The transport contract for POST /orders/:id/cancel. */
export class CancelOrderBodyDto {
  @IsString()
  reason: string;
}

/** The full command shape, once the controller has merged in the path id. */
export class CancelOrderDto extends CancelOrderBodyDto {
  orderId: string;
}
