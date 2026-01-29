/* eslint-disable prettier/prettier */
import { v4 as uuidv4 } from 'uuid';
import { ArgumentNullException } from './exceptions/domain.exception';

/**
 * Metadata information for domain events.
 * Essential for Event Sourcing compatibility and event traceability.
 *
 * @remarks
 * - aggregateId: Identifies which aggregate instance produced this event
 * - aggregateType: The type/class name of the aggregate
 * - aggregateVersion: Version of the aggregate after this event (for optimistic locking)
 * - eventVersion: Schema version of the event (for event evolution)
 * - correlationId: Groups related events across aggregates (optional)
 * - causationId: ID of the event/command that caused this event (optional)
 * - userId: ID of the user who triggered this event (optional)
 * - timestamp: When the event occurred (ISO 8601 UTC string)
 *
 * @example
 * ```typescript
 * const metadata: EventMetadata = {
 *   aggregateId: order.id,
 *   aggregateType: 'Order',
 *   aggregateVersion: 5,
 *   eventVersion: 1,
 *   correlationId: requestId,
 *   causationId: command.id,
 *   userId: currentUser.id,
 *   timestamp: new Date().toISOString()
 * };
 * ```
 */
export type EventMetadata = {
  readonly aggregateId: string;
  readonly aggregateType: string;
  readonly aggregateVersion: number;
  readonly eventVersion: number;
  readonly correlationId?: string;
  readonly causationId?: string;
  readonly userId?: string;
  readonly timestamp: string; // ISO 8601 UTC string
};

/**
 * Builder for creating EventMetadata with validation.
 * Follows the Builder pattern for complex object construction.
 *
 * @example
 * ```typescript
 * const metadata = EventMetadataBuilder
 *   .create('order-123', 'Order', 5)
 *   .withCorrelationId(requestId)
 *   .withUserId(userId)
 *   .build();
 * ```
 */
export class EventMetadataBuilder {
  private aggregateId: string;
  private aggregateType: string;
  private aggregateVersion: number;
  private eventVersion: number = 1;
  private correlationId?: string;
  private causationId?: string;
  private userId?: string;
  private timestamp: string;

  private constructor(
    aggregateId: string,
    aggregateType: string,
    aggregateVersion: number,
  ) {
    this.aggregateId = aggregateId;
    this.aggregateType = aggregateType;
    this.aggregateVersion = aggregateVersion;
    this.timestamp = new Date().toISOString();
  }

  /**
   * Creates a new metadata builder.
   */
  static create(
    aggregateId: string,
    aggregateType: string,
    aggregateVersion: number,
  ): EventMetadataBuilder {
    if (!aggregateId || !aggregateType) {
      throw new ArgumentNullException(
        'aggregateId and aggregateType are required',
      );
    }
    if (aggregateVersion < 0) {
      throw new Error('aggregateVersion must be non-negative');
    }
    return new EventMetadataBuilder(
      aggregateId,
      aggregateType,
      aggregateVersion,
    );
  }

  withEventVersion(version: number): this {
    if (version < 1) {
      throw new Error('eventVersion must be at least 1');
    }
    this.eventVersion = version;
    return this;
  }

  withCorrelationId(correlationId: string): this {
    this.correlationId = correlationId;
    return this;
  }

  withCausationId(causationId: string): this {
    this.causationId = causationId;
    return this;
  }

  withUserId(userId: string): this {
    this.userId = userId;
    return this;
  }

  withTimestamp(timestamp: Date | string): this {
    this.timestamp =
      timestamp instanceof Date ? timestamp.toISOString() : timestamp;
    return this;
  }

  build(): EventMetadata {
    return {
      aggregateId: this.aggregateId,
      aggregateType: this.aggregateType,
      aggregateVersion: this.aggregateVersion,
      eventVersion: this.eventVersion,
      correlationId: this.correlationId,
      causationId: this.causationId,
      userId: this.userId,
      timestamp: this.timestamp,
    };
  }
}

/**
 * Interface for objects that can be serialized to/from JSON.
 */
export interface ISerializable {
  toJSON(): Record<string, unknown>;
  // fromJSON is typically a static method, defined per class
}

/**
 * Base class for all domain events in the system.
 * Implements event sourcing patterns and provides infrastructure for event-driven architecture.
 *
 * @template TData - The type of event-specific data (optional, defaults to Record<string, unknown>)
 *
 * @remarks
 * Domain events represent something that happened in the domain that domain experts care about.
 * They are immutable by design and contain all information needed to reconstruct system state.
 *
 * **Key Responsibilities:**
 * - Unique event identification (eventId)
 * - Timestamp tracking (occurredOn)
 * - Event type classification (eventType)
 * - Schema versioning (eventVersion)
 * - Metadata management (aggregate info, correlation, causation)
 * - Serialization support for persistence
 * - Deserialization support for replay
 *
 * **Usage Patterns:**
 * 1. **Create new events:** Use when domain operations complete successfully
 * 2. **Persist events:** Serialize with toJSON() for event store
 * 3. **Replay events:** Deserialize with fromJSON() for event sourcing
 * 4. **Publish events:** Send to event bus for other bounded contexts
 *
 * @example
 * ```typescript
 * // Define a domain event
 * class OrderCreatedEvent extends DomainEvent<{ orderId: string; total: number }> {
 *   constructor(
 *     public readonly orderId: string,
 *     public readonly total: number,
 *     metadata: EventMetadata
 *   ) {
 *     super(metadata);
 *   }
 *
 *   static fromJSON(json: Record<string, unknown>): OrderCreatedEvent {
 *     const metadata = DomainEvent.extractMetadata(json);
 *     const data = DomainEvent.extractEventData(json);
 *     return new OrderCreatedEvent(
 *       data.orderId as string,
 *       data.total as number,
 *       metadata
 *     );
 *   }
 * }
 *
 * // Create and use the event
 * const metadata = EventMetadataBuilder
 *   .create(order.id, 'Order', 1)
 *   .withUserId(userId)
 *   .build();
 *
 * const event = new OrderCreatedEvent(order.id, order.total, metadata);
 *
 * // Serialize for storage
 * const json = event.toJSON();
 * await eventStore.save(json);
 *
 * // Deserialize for replay
 * const reconstructed = OrderCreatedEvent.fromJSON(json);
 * ```
 *
 * @see {@link EventMetadata} for metadata structure
 * @see {@link EventMetadataBuilder} for building metadata
 */
export abstract class DomainEvent implements ISerializable {
  /**
   * Unique identifier for this specific event instance.
   */
  readonly eventId: string;

  /**
   * When the event occurred (UTC timestamp).
   */
  readonly occurredOn: Date;

  /**
   * Event type name (typically the class name).
   */
  readonly eventType: string;

  /**
   * Version of the event schema (for schema evolution in Event Sourcing).
   */
  readonly eventVersion: number;

  /**
   * Metadata containing aggregate and event sourcing information.
   */
  readonly metadata: EventMetadata;

  /**
   * Creates a new domain event.
   *
   * @param metadata - Event metadata including aggregate information
   * @param occurredOn - When the event occurred (optional, defaults to now)
   *
   * @throws {ArgumentNullException} If metadata is null or undefined
   * @throws {Error} If metadata validation fails
   *
   * @remarks
   * The occurredOn parameter allows for precise timestamp control, which is important for:
   * - Event replay from storage (use stored timestamp)
   * - Testing (use fixed timestamp)
   * - New events (use default current time)
   */
  constructor(metadata: EventMetadata, occurredOn?: Date) {
    if (!metadata) {
      throw new ArgumentNullException('metadata');
    }

    this.validateMetadata(metadata);

    this.eventId = uuidv4();
    this.occurredOn = occurredOn || new Date();
    this.eventType = this.constructor.name;
    this.eventVersion = metadata.eventVersion;

    // Preserve metadata timestamp or use occurredOn
    this.metadata = {
      ...metadata,
      timestamp: metadata.timestamp || this.occurredOn.toISOString(),
    };
  }

  /**
   * Validates event metadata.
   *
   * @param metadata - Metadata to validate
   * @throws {Error} If validation fails
   */
  private validateMetadata(metadata: EventMetadata): void {
    if (!metadata.aggregateId) {
      throw new Error('EventMetadata.aggregateId is required');
    }
    if (!metadata.aggregateType) {
      throw new Error('EventMetadata.aggregateType is required');
    }
    if (metadata.aggregateVersion < 0) {
      throw new Error('EventMetadata.aggregateVersion must be non-negative');
    }
    if (metadata.eventVersion < 1) {
      throw new Error('EventMetadata.eventVersion must be at least 1');
    }
  }

  /**
   * Serializes the event to JSON for persistence.
   * Essential for Event Sourcing storage and event transmission.
   *
   * @returns JSON representation of the event with all data needed for reconstruction
   *
   * @remarks
   * The returned object contains:
   * - eventId: Unique event identifier
   * - eventType: Event class name for deserialization routing
   * - eventVersion: Schema version for handling event evolution
   * - occurredOn: ISO 8601 timestamp
   * - metadata: Full event metadata
   * - data: Event-specific payload
   *
   * @example
   * ```typescript
   * const event = new OrderCreatedEvent(orderId, total, metadata);
   * const json = event.toJSON();
   * await eventStore.append(json);
   * ```
   */
  toJSON(): Record<string, unknown> {
    return {
      eventId: this.eventId,
      eventType: this.eventType,
      eventVersion: this.eventVersion,
      occurredOn: this.occurredOn.toISOString(),
      metadata: this.metadata,
      data: this.getEventData(),
    };
  }

  /**
   * Gets the event-specific data payload.
   * Override this method in derived classes to include event-specific properties.
   *
   * @returns Object containing event-specific data
   */
  protected getEventData(): Record<string, unknown> {
    // Get all properties except the base class properties
    const data: Record<string, unknown> = {};
    const excludeKeys = new Set([
      'eventId',
      'occurredOn',
      'eventType',
      'eventVersion',
      'metadata',
      'toJSON',
      'fromJSON',
      'getEventData',
    ]);

    Object.keys(this).forEach((key) => {
      if (!excludeKeys.has(key)) {
        const value = (this as Record<string, unknown>)[key];
        // Serialize Date objects to ISO strings
        if (value instanceof Date) {
          data[key] = value.toISOString();
        } else {
          data[key] = value;
        }
      }
    });

    return data;
  }

  /**
   * Helper method to extract metadata from JSON.
   * Useful for derived classes implementing fromJSON.
   *
   * @param json - JSON representation of an event
   * @returns Event metadata
   * @throws {Error} If metadata is missing or invalid
   */
  protected static extractMetadata(
    json: Record<string, unknown>,
  ): EventMetadata {
    const metadata = json.metadata as EventMetadata | undefined;
    if (!metadata) {
      throw new Error('Event JSON missing metadata field');
    }
    return metadata;
  }

  /**
   * Helper method to extract event data from JSON.
   * Useful for derived classes implementing fromJSON.
   *
   * @param json - JSON representation of an event
   * @returns Event-specific data payload
   */
  protected static extractEventData(
    json: Record<string, unknown>,
  ): Record<string, unknown> {
    return (json.data as Record<string, unknown>) || {};
  }

  /**
   * Helper method to extract timestamp from JSON.
   *
   * @param json - JSON representation of an event
   * @returns Date object from occurredOn field
   */
  protected static extractOccurredOn(json: Record<string, unknown>): Date {
    const occurredOn = json.occurredOn as string | undefined;
    if (!occurredOn) {
      throw new Error('Event JSON missing occurredOn field');
    }
    return new Date(occurredOn);
  }

  /**
   * Gets the aggregate ID from metadata.
   */
  get aggregateId(): string {
    return this.metadata.aggregateId;
  }

  /**
   * Gets the aggregate type from metadata.
   */
  get aggregateType(): string {
    return this.metadata.aggregateType;
  }

  /**
   * Gets the aggregate version from metadata.
   */
  get aggregateVersion(): number {
    return this.metadata.aggregateVersion;
  }

  /**
   * Checks if this event is part of a correlation chain.
   */
  get hasCorrelationId(): boolean {
    return !!this.metadata.correlationId;
  }

  /**
   * Checks if this event was caused by another event.
   */
  get hasCausationId(): boolean {
    return !!this.metadata.causationId;
  }

  /**
   * Checks if this event has user information.
   */
  get hasUserId(): boolean {
    return !!this.metadata.userId;
  }

  /**
   * Compares this event with another for equality based on eventId.
   *
   * @param other - Another domain event to compare
   * @returns true if events have the same eventId
   */
  equals(other: DomainEvent): boolean {
    if (!other) {
      return false;
    }
    return this.eventId === other.eventId;
  }

  /**
   * Checks if this event belongs to a specific aggregate instance.
   *
   * @param aggregateId - The aggregate ID to check
   * @returns true if event belongs to the aggregate
   */
  belongsToAggregate(aggregateId: string): boolean {
    return this.metadata.aggregateId === aggregateId;
  }

  /**
   * Checks if this event is of a specific aggregate type.
   *
   * @param aggregateType - The aggregate type to check
   * @returns true if event is from this aggregate type
   */
  isAggregateType(aggregateType: string): boolean {
    return this.metadata.aggregateType === aggregateType;
  }
}

/**
 * Alias for backward compatibility.
 * @deprecated Use DomainEvent instead
 */
export const AbstractDomainEvent = DomainEvent;
