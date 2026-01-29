import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetOrderQuery } from './get-order.query';
import { OrderResponse, OrderItemResponse } from '../dtos/order-response.dto';
import { OrderRepository } from 'src/orders/infrastructure/repositories/order.repository';
import { NotFoundException } from '@nestjs/common';

@QueryHandler(GetOrderQuery)
export class GetOrderQueryHandler implements IQueryHandler<GetOrderQuery> {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(query: GetOrderQuery): Promise<OrderResponse> {
    const order = await this.orderRepository.findById(query.id);

    if (!order) {
      throw new NotFoundException(`Order with id ${query.id} not found`);
    }

    const items: OrderItemResponse[] = order.items.map((item) => ({
      productId: item.productId.getValue(),
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice.amount.toString(),
      subtotal: item.totalPrice.amount.toString(),
    }));

    return {
      id: order.id.getValue(),
      status: order.status,
      customerName: order.customerInfo.name,
      customerEmail: order.customerInfo.email,
      items,
      total: order.totalAmount.amount.toString(),
      currency: order.currency,
      confirmedAt: order.confirmedAt,
      shippedAt: order.shippedAt,
      deliveredAt: order.deliveredAt,
    };
  }
}
