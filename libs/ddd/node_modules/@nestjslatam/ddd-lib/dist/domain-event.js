"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractDomainEvent = exports.DomainEvent = exports.EventMetadataBuilder = void 0;
const uuid_1 = require("uuid");
const domain_exception_1 = require("./exceptions/domain.exception");
class EventMetadataBuilder {
    constructor(aggregateId, aggregateType, aggregateVersion) {
        this.eventVersion = 1;
        this.aggregateId = aggregateId;
        this.aggregateType = aggregateType;
        this.aggregateVersion = aggregateVersion;
        this.timestamp = new Date().toISOString();
    }
    static create(aggregateId, aggregateType, aggregateVersion) {
        if (!aggregateId || !aggregateType) {
            throw new domain_exception_1.ArgumentNullException('aggregateId and aggregateType are required');
        }
        if (aggregateVersion < 0) {
            throw new Error('aggregateVersion must be non-negative');
        }
        return new EventMetadataBuilder(aggregateId, aggregateType, aggregateVersion);
    }
    withEventVersion(version) {
        if (version < 1) {
            throw new Error('eventVersion must be at least 1');
        }
        this.eventVersion = version;
        return this;
    }
    withCorrelationId(correlationId) {
        this.correlationId = correlationId;
        return this;
    }
    withCausationId(causationId) {
        this.causationId = causationId;
        return this;
    }
    withUserId(userId) {
        this.userId = userId;
        return this;
    }
    withTimestamp(timestamp) {
        this.timestamp =
            timestamp instanceof Date ? timestamp.toISOString() : timestamp;
        return this;
    }
    build() {
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
exports.EventMetadataBuilder = EventMetadataBuilder;
class DomainEvent {
    constructor(metadata, occurredOn) {
        if (!metadata) {
            throw new domain_exception_1.ArgumentNullException('metadata');
        }
        this.validateMetadata(metadata);
        this.eventId = (0, uuid_1.v4)();
        this.occurredOn = occurredOn || new Date();
        this.eventType = this.constructor.name;
        this.eventVersion = metadata.eventVersion;
        this.metadata = {
            ...metadata,
            timestamp: metadata.timestamp || this.occurredOn.toISOString(),
        };
    }
    validateMetadata(metadata) {
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
    toJSON() {
        return {
            eventId: this.eventId,
            eventType: this.eventType,
            eventVersion: this.eventVersion,
            occurredOn: this.occurredOn.toISOString(),
            metadata: this.metadata,
            data: this.getEventData(),
        };
    }
    getEventData() {
        const data = {};
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
                const value = this[key];
                if (value instanceof Date) {
                    data[key] = value.toISOString();
                }
                else {
                    data[key] = value;
                }
            }
        });
        return data;
    }
    static extractMetadata(json) {
        const metadata = json.metadata;
        if (!metadata) {
            throw new Error('Event JSON missing metadata field');
        }
        return metadata;
    }
    static extractEventData(json) {
        return json.data || {};
    }
    static extractOccurredOn(json) {
        const occurredOn = json.occurredOn;
        if (!occurredOn) {
            throw new Error('Event JSON missing occurredOn field');
        }
        return new Date(occurredOn);
    }
    get aggregateId() {
        return this.metadata.aggregateId;
    }
    get aggregateType() {
        return this.metadata.aggregateType;
    }
    get aggregateVersion() {
        return this.metadata.aggregateVersion;
    }
    get hasCorrelationId() {
        return !!this.metadata.correlationId;
    }
    get hasCausationId() {
        return !!this.metadata.causationId;
    }
    get hasUserId() {
        return !!this.metadata.userId;
    }
    equals(other) {
        if (!other) {
            return false;
        }
        return this.eventId === other.eventId;
    }
    belongsToAggregate(aggregateId) {
        return this.metadata.aggregateId === aggregateId;
    }
    isAggregateType(aggregateType) {
        return this.metadata.aggregateType === aggregateType;
    }
}
exports.DomainEvent = DomainEvent;
exports.AbstractDomainEvent = DomainEvent;
//# sourceMappingURL=domain-event.js.map