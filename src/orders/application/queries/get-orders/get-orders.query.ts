import { GetOrdersDto } from '../dtos/order-response.dto';

export class GetOrdersQuery {
  constructor(
    public readonly status?: string,
    public readonly limit: number = 10,
    public readonly offset: number = 0,
  ) {}
}

