export type EventMetadata = {
  readonly aggregateId: string;
  readonly aggregateType: string;
  readonly aggregateVersion: number;
  readonly eventVersion: number;
  readonly correlationId?: string;
  readonly causationId?: string;
  readonly userId?: string;
  readonly timestamp: string;
};
export declare class EventMetadataBuilder {
  private aggregateId;
  private aggregateType;
  private aggregateVersion;
  private eventVersion;
  private correlationId?;
  private causationId?;
  private userId?;
  private timestamp;
  private constructor();
  static create(
    aggregateId: string,
    aggregateType: string,
    aggregateVersion: number,
  ): EventMetadataBuilder;
  withEventVersion(version: number): this;
  withCorrelationId(correlationId: string): this;
  withCausationId(causationId: string): this;
  withUserId(userId: string): this;
  withTimestamp(timestamp: Date | string): this;
  build(): EventMetadata;
}
export interface ISerializable {
  toJSON(): Record<string, unknown>;
}
export declare abstract class DomainEvent implements ISerializable {
  readonly eventId: string;
  readonly occurredOn: Date;
  readonly eventType: string;
  readonly eventVersion: number;
  readonly metadata: EventMetadata;
  constructor(metadata: EventMetadata, occurredOn?: Date);
  private validateMetadata;
  toJSON(): Record<string, unknown>;
  protected getEventData(): Record<string, unknown>;
  protected static extractMetadata(
    json: Record<string, unknown>,
  ): EventMetadata;
  protected static extractEventData(
    json: Record<string, unknown>,
  ): Record<string, unknown>;
  protected static extractOccurredOn(json: Record<string, unknown>): Date;
  get aggregateId(): string;
  get aggregateType(): string;
  get aggregateVersion(): number;
  get hasCorrelationId(): boolean;
  get hasCausationId(): boolean;
  get hasUserId(): boolean;
  equals(other: DomainEvent): boolean;
  belongsToAggregate(aggregateId: string): boolean;
  isAggregateType(aggregateType: string): boolean;
}
export declare const AbstractDomainEvent: typeof DomainEvent;
//# sourceMappingURL=domain-event.d.ts.map
