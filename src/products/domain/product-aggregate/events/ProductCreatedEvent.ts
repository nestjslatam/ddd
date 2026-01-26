import { AbstractDomainEvent, EventMetadata } from '@nestjslatam/ddd-lib';

export class ProductCreatedEvent extends AbstractDomainEvent {
  constructor(
    readonly productId: string,
    readonly productName: string,
    metadata: EventMetadata,
  ) {
    super(metadata);
  }

  /**
   * Factory method to create event from JSON (for Event Sourcing).
   */
  static fromJSON(json: Record<string, unknown>): ProductCreatedEvent {
    const metadata = AbstractDomainEvent.extractMetadata(json);
    const eventData = AbstractDomainEvent.extractEventData(json);

    return new ProductCreatedEvent(
      eventData.productId as string,
      eventData.productName as string,
      metadata,
    );
  }
}
