import { IsOptional, IsString } from 'class-validator';

/** The transport contract for POST /orders/:id/ship. */
export class ShipOrderBodyDto {
  @IsOptional()
  @IsString()
  trackingNumber?: string;
}

/** The full command shape, once the controller has merged in the path id. */
export class ShipOrderDto extends ShipOrderBodyDto {
  orderId: string;
}
