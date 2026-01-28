import { Injectable } from '@nestjs/common';
import { Product } from '../../domain/product-aggregate/product';

/**
 * In-Memory Product Repository
 * En una implementación real, esto sería una implementación con base de datos
 */
@Injectable()
export class ProductRepository {
  private products: Map<string, Product> = new Map();

  async save(product: Product): Promise<void> {
    this.products.set(product.id.getValue(), product);
  }

  async findById(id: string): Promise<Product | null> {
    return this.products.get(id) || null;
  }

  async findAll(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async delete(id: string): Promise<void> {
    this.products.delete(id);
  }

  async exists(id: string): Promise<boolean> {
    return this.products.has(id);
  }
}
