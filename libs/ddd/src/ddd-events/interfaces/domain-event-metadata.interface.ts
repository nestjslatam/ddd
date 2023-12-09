export interface IDomainEventMetadata {
  readonly aggregateId: string;
  readonly ocurredOn: Date;
  readonly timestamp: number;
  readonly trackingId?: string;
  readonly requestId?: string;
}
