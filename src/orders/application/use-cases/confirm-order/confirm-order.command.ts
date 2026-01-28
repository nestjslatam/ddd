import { ConfirmOrderDto } from './confirm-order.dto';

export class ConfirmOrderCommand {
  public readonly orderId: string;

  constructor(dto: ConfirmOrderDto) {
    this.orderId = dto.orderId;
  }
}

