import { Injectable } from '@nestjs/common';
import { Order } from '../../domain/order-aggregate/order';

/**
 * In-Memory Order Repository
 * En una implementación real, esto sería una implementación con base de datos
 */
@Injectable()
export class OrderRepository {
  private orders: Map<string, Order> = new Map();

  async save(order: Order): Promise<void> {
    this.orders.set(order.id.getValue(), order);
  }

  async findById(id: string): Promise<Order | null> {
    return this.orders.get(id) || null;
  }

  async findAll(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async delete(id: string): Promise<void> {
    this.orders.delete(id);
  }

  async exists(id: string): Promise<boolean> {
    return this.orders.has(id);
  }
}
