/**
 * Represents the metadata associated with a domain event.
 */
export interface IDomainEventMetadata {
  /**
   * The unique identifier of the aggregate that the event belongs to.
   */
  readonly aggregateId: string;
  /**
   * The date and time when the event occurred.
   */
  readonly ocurredOn: Date;
  /**
   * The timestamp of when the event occurred.
   */
  readonly timestamp: number;
  /**
   * An optional tracking ID associated with the event.
   */
  readonly trackingId?: string;
  /**
   * An optional request ID associated with the event.
   */
  readonly requestId?: string;
}
