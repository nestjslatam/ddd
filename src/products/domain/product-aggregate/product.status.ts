import { DddEnum } from '@nestjslatam/ddd-lib';

export class ProductStatus extends DddEnum {
  public static readonly ACTIVE = new ProductStatus(1, 'ACTIVE');
  public static readonly INACTIVE = new ProductStatus(2, 'INACTIVE');
  public static readonly DELETED = new ProductStatus(3, 'DELETED');

  private constructor(id: number, name: string) {
    super(id, name);
  }
}