export class GetOrderDto {
  id: string;
}

export class GetOrdersDto {
  status?: string;
  limit?: number;
  offset?: number;
}

export class OrderResponse {
  id: string;
  status: string;
  customerName: string;
  customerEmail: string;
  items: OrderItemResponse[];
  total: string;
  currency: string;
  confirmedAt?: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
}

export class OrderItemResponse {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: string;
  subtotal: string;
}
