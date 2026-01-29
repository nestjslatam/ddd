import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetOrdersQuery } from './get-orders.query';
import { OrderResponse, OrderItemResponse } from '../dtos/order-response.dto';
import { OrderRepository } from 'src/orders/infrastructure/repositories/order.repository';

@QueryHandler(GetOrdersQuery)
export class GetOrdersQueryHandler implements IQueryHandler<GetOrdersQuery> {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(query: GetOrdersQuery): Promise<OrderResponse[]> {
    let orders = await this.orderRepository.findAll();

    // Filter by status if provided
    if (query.status) {
      orders = orders.filter((order) => order.status === query.status);
    }

    // Apply pagination
    const paginatedOrders = orders.slice(
      query.offset,
      query.offset + query.limit,
    );

    return paginatedOrders.map((order) => {
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
    });
  }
}
