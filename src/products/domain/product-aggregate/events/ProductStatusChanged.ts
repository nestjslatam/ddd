import { AbstractDomainEvent, EventMetadata } from '@nestjslatam/ddd-lib';

export class ProductStatusChangedEvent extends AbstractDomainEvent {
  constructor(
    readonly productId: string,
    readonly productStatus: string,
    metadata: EventMetadata,
  ) {
    super(metadata);

    this.productId = productId;
    this.productStatus = productStatus;
  }

  static fromJSON(json: Record<string, unknown>): ProductStatusChangedEvent {
    const metadata = AbstractDomainEvent.extractMetadata(json);
    const eventData = AbstractDomainEvent.extractEventData(json);

    return new ProductStatusChangedEvent(
      eventData.productId as string,
      eventData.productStatus as string,
      metadata,
    );
  }
}
