import { CancelOrderDto } from './cancel-order.dto';

export class CancelOrderCommand {
  public readonly orderId: string;
  public readonly reason: string;

  constructor(dto: CancelOrderDto) {
    this.orderId = dto.orderId;
    this.reason = dto.reason;
  }
}
