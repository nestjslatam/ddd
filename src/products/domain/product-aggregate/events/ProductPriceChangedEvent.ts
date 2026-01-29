import { AbstractDomainEvent, EventMetadata } from '@nestjslatam/ddd-lib';

export class ProductPriceChangedEvent extends AbstractDomainEvent {
  constructor(
    readonly productId: string,
    readonly productPrice: number,
    metadata: EventMetadata,
  ) {
    super(metadata);

    this.productId = productId;
    this.productPrice = productPrice;
  }

  static fromJSON(json: Record<string, unknown>): ProductPriceChangedEvent {
    const metadata = AbstractDomainEvent.extractMetadata(json);
    const eventData = AbstractDomainEvent.extractEventData(json);

    return new ProductPriceChangedEvent(
      eventData.productId as string,
      eventData.productPrice as number,
      metadata,
    );
  }
}
