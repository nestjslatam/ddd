import { AbstractDomainEvent, EventMetadata } from '@nestjslatam/ddd-lib';

export class ProductNameChangedEvent extends AbstractDomainEvent {
  constructor(
    readonly productId: string,
    readonly productName: string,
    metadata: EventMetadata,
  ) {
    super(metadata);

    this.productId = productId;
    this.productName = productName;
  }

  static fromJSON(json: Record<string, unknown>): ProductNameChangedEvent {
    const metadata = AbstractDomainEvent.extractMetadata(json);
    const eventData = AbstractDomainEvent.extractEventData(json);

    return new ProductNameChangedEvent(
      eventData.productId as string,
      eventData.productName as string,
      metadata,
    );
  }
}
