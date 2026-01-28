import { ShipOrderDto } from './ship-order.dto';

export class ShipOrderCommand {
  public readonly orderId: string;
  public readonly trackingNumber?: string;

  constructor(dto: ShipOrderDto) {
    this.orderId = dto.orderId;
    this.trackingNumber = dto.trackingNumber;
  }
}
