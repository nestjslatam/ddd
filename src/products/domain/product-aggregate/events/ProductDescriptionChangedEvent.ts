import { AbstractDomainEvent, EventMetadata } from '@nestjslatam/ddd-lib';

export class ProductDescriptionChangedEvent extends AbstractDomainEvent {
  constructor(
    readonly productId: string,
    readonly productDescription: string,
    metadata: EventMetadata,
  ) {
    super(metadata);

    this.productId = productId;
    this.productDescription = productDescription;
  }

  static fromJSON(
    json: Record<string, unknown>,
  ): ProductDescriptionChangedEvent {
    const metadata = AbstractDomainEvent.extractMetadata(json);
    const eventData = AbstractDomainEvent.extractEventData(json);

    return new ProductDescriptionChangedEvent(
      eventData.productId as string,
      eventData.productDescription as string,
      metadata,
    );
  }
}
