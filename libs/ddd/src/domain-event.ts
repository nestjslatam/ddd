/* eslint-disable prettier/prettier */
import { v4 as uuidv4 } from 'uuid';

/**
 * Metadata information for domain events.
 * Essential for Event Sourcing compatibility.
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
}

/**
 * Base class for all domain events.
 * Designed to support Event Sourcing patterns.
 * 
 * Features:
 * - Unique event ID (UUID)
 * - UTC timestamp
 * - Event versioning
 * - Serialization/Deserialization support
 * - Rich metadata for event sourcing
 */
export abstract class AbstractDomainEvent {
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
   * @param eventVersion - Version of the event schema (default: 1)
   */
  constructor(
    metadata: EventMetadata,
    eventVersion: number = 1,
  ) {
    this.eventId = uuidv4();
    this.occurredOn = new Date(Date.now());
    this.eventType = this.constructor.name;
    this.eventVersion = eventVersion;
    
    // Ensure timestamp in metadata is UTC ISO string
    this.metadata = {
      ...metadata,
      timestamp: this.occurredOn.toISOString(),
    };
  }

  /**
   * Serializes the event to JSON for persistence.
   * Essential for Event Sourcing storage.
   * 
   * @returns JSON representation of the event
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
   */
  protected static extractMetadata(json: Record<string, unknown>): EventMetadata {
    return json.metadata as EventMetadata;
  }

  /**
   * Helper method to extract event data from JSON.
   * Useful for derived classes implementing fromJSON.
   */
  protected static extractEventData(json: Record<string, unknown>): Record<string, unknown> {
    return (json.data as Record<string, unknown>) || {};
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
}


