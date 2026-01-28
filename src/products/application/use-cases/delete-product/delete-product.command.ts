export class DeleteProductCommand {
  public readonly productId: string;

  constructor(productId: string) {
    this.productId = productId;
  }
}
