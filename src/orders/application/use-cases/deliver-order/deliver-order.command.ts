import { DeliverOrderDto } from './deliver-order.dto';

export class DeliverOrderCommand {
  public readonly orderId: string;

  constructor(dto: DeliverOrderDto) {
    this.orderId = dto.orderId;
  }
}
