# Architecture Overview

This document provides a comprehensive overview of the Domain-Driven Design (DDD) architecture implemented in this NestJS application.

## Table of Contents

- [Architectural Layers](#architectural-layers)
- [Domain-Driven Design Principles](#domain-driven-design-principles)
- [CQRS Pattern](#cqrs-pattern)
- [Event-Driven Architecture](#event-driven-architecture)
- [Dependency Flow](#dependency-flow)
- [Module Structure](#module-structure)

## Architectural Layers

The application follows a **layered architecture** with clear separation of concerns:

### 1. Presentation Layer

**Location**: `src/*/application/use-cases/*/controllers/`

- **Purpose**: Handles HTTP requests and responses
- **Responsibilities**:
  - Receive HTTP requests
  - Validate input DTOs
  - Dispatch commands/queries to the application layer
  - Return HTTP responses
- **Technologies**: NestJS Controllers, Swagger, GraphQL

**Example**: `CreateSingerController` receives POST requests to create singers.

### 2. Application Layer

**Location**: `src/*/application/`

- **Purpose**: Orchestrates domain operations and coordinates use cases
- **Components**:
  - **Commands**: Write operations (Create, Update, Delete)
  - **Queries**: Read operations (GetById, GetByCriteria)
  - **Command Handlers**: Execute commands and modify domain state
  - **Query Handlers**: Retrieve and return data
  - **Sagas**: Long-running processes that coordinate multiple operations
  - **DTOs**: Data Transfer Objects for input/output
- **Key Principle**: Application layer should not contain business logic

**Example**: `CreateSingerCommandHandler` orchestrates the creation of a singer.

### 3. Domain Layer

**Location**: `src/*/domain/`

- **Purpose**: Contains the core business logic and domain models
- **Components**:
  - **Aggregate Roots**: Entities that manage consistency boundaries
  - **Entities**: Domain objects with identity
  - **Value Objects**: Immutable objects defined by their attributes
  - **Domain Events**: Events that represent something that happened in the domain
  - **Business Rules**: Validation and invariants enforced at the domain level
- **Key Principle**: Domain layer should be independent of infrastructure and application concerns

**Example**: `Singer` aggregate root enforces business rules like "cannot remove subscribed singer".

### 4. Infrastructure Layer

**Location**: `src/*/infrastructure/`

- **Purpose**: Provides technical capabilities to support other layers
- **Components**:
  - **Repositories**: Implementations of domain repository interfaces
  - **Mappers**: Convert between domain models and persistence models
  - **Database Tables**: TypeORM entity definitions
  - **External Services**: Integration with external systems
- **Key Principle**: Infrastructure layer depends on domain layer, not vice versa

**Example**: `SingerRepository` implements persistence operations for the `Singer` aggregate.

## Domain-Driven Design Principles

### Aggregate Roots

An **Aggregate Root** is an entity that controls access to a set of related objects (the aggregate). It ensures consistency and enforces invariants.

**Example**: `Singer` is an aggregate root that:
- Manages its own songs (entities)
- Enforces business rules (e.g., cannot remove subscribed singer)
- Publishes domain events when state changes

```typescript
// Singer aggregate root
export class Singer extends DomainAggregateRoot<ISingerProps> {
  // Business rules validation
  protected businessRules(props: ISingerProps): void { ... }
  
  // Domain operations
  subscribe(audit: DomainAudit): this { ... }
  remove(audit: DomainAudit): this { ... }
  addSong(song: Song, audit: DomainAudit): this { ... }
}
```

### Entities

**Entities** are objects with unique identity that can change over time.

**Example**: `Song` is an entity within the `Singer` aggregate:
- Has a unique ID
- Can be created, modified, or removed
- Enforces its own business rules

### Value Objects

**Value Objects** are immutable objects defined entirely by their attributes. Two value objects are equal if all their attributes are equal.

**Examples**:
- `FullName`: Represents a singer's full name
- `PicturePath`: Represents a picture URL
- `Id`: Represents a unique identifier
- `Name`: Represents a song name

```typescript
// Value object example
export class FullName extends AbstractDomainString {
  // Immutable, validated on creation
  static create(value: string): FullName { ... }
}
```

### Domain Events

**Domain Events** represent something that happened in the domain that domain experts care about.

**Examples**:
- `SingerCreatedDomainEvent`: Published when a singer is created
- `SingerSubscribedDomainEvent`: Published when a singer subscribes
- `SingerDeletedDomainEvent`: Published when a singer is deleted

```typescript
// Domain event example
export class SingerCreatedDomainEvent extends DomainEvent {
  constructor(
    readonly singerId: string,
    readonly singerName: string,
  ) { ... }
}
```

### Business Rules

**Business Rules** are invariants that must always be true. They are enforced at the domain level.

**Example**: In the `Singer` aggregate:
- If a singer is subscribed, a subscribed date is required
- A subscribed singer cannot be removed
- A singer cannot subscribe twice

## CQRS Pattern

**CQRS (Command Query Responsibility Segregation)** separates read and write operations:

### Commands (Write Operations)

- **Purpose**: Modify domain state
- **Characteristics**: 
  - Return void or minimal response
  - May publish domain events
  - Execute through CommandBus
- **Location**: `src/*/application/use-cases/commands/`

**Example Commands**:
- `CreateSingerCommand`
- `ChangeFullNameSingerCommand`
- `SubscribeSingerCommand`
- `RemoveSingerCommand`

### Queries (Read Operations)

- **Purpose**: Retrieve data without modifying state
- **Characteristics**:
  - Return data
  - Should not have side effects
  - Execute through QueryBus
- **Location**: `src/*/application/use-cases/queries/`

**Example Queries**:
- `GetSingerByIdQuery`
- `GetSingersCriteriaQuery`

## Event-Driven Architecture

### Domain Events Flow

1. **Domain Operation**: A domain method is called (e.g., `singer.subscribe()`)
2. **Event Creation**: Domain event is added to the aggregate
3. **Event Publishing**: When the aggregate is committed, events are published
4. **Event Handling**: Event handlers react to events
5. **Saga Execution**: Sagas may listen to events and trigger new commands

### Event Handlers

**Location**: `src/*/application/use-cases/commands/*/created-*.domainevent-handler.ts`

Event handlers react to domain events and can:
- Update read models
- Send notifications
- Trigger external integrations
- Update other aggregates

### Sagas

**Location**: `src/*/application/sagas/`

Sagas are long-running processes that:
- Listen to multiple domain events
- Coordinate complex workflows
- May trigger new commands
- Use RxJS for event stream processing

**Example**: `SystemSagas` listens to `SingerCreatedDomainEvent` and logs the event.

## Dependency Flow

The dependency flow follows the **Dependency Inversion Principle**:

```
Presentation → Application → Domain ← Infrastructure
```

- **Domain Layer**: No dependencies on other layers
- **Application Layer**: Depends only on Domain
- **Infrastructure Layer**: Depends only on Domain
- **Presentation Layer**: Depends on Application

## Module Structure

### Shared Module

**Location**: `src/shared/`

Contains reusable components:
- **Domain Primitives**: `Id`, `Name`, `RegisterDate`, `SubscribedDate`, `Url`
- **Base Classes**: `AbstractCommandHandler`
- **Exceptions**: `DomainException`, `ApplicationException`, `DatabaseException`
- **Context**: Request context management

### Domain Modules

**Location**: `src/*/` (e.g., `src/singers/`)

Each domain module is self-contained:
- **Domain**: Domain models and business logic
- **Application**: Use cases and orchestration
- **Infrastructure**: Technical implementations

### Module Registration

Modules are registered in `app.module.ts`:

```typescript
@Module({
  imports: [
    SharedModule,
    SingersModule,
    // ... other modules
  ],
})
export class AppModule {}
```

## Best Practices

1. **Keep Domain Pure**: Domain layer should not depend on frameworks or infrastructure
2. **Enforce Business Rules**: Business rules belong in the domain layer
3. **Use Value Objects**: Prefer value objects over primitives for type safety
4. **Publish Domain Events**: Use events to communicate between aggregates
5. **Separate Commands and Queries**: Use CQRS for complex domains
6. **Validate at Boundaries**: Validate input at the application layer
7. **Map at Boundaries**: Convert between layers using mappers

## Related Documentation

- [Domain Layer](domain-layer.md) - Detailed domain model documentation
- [Application Layer](application-layer.md) - Commands, queries, and handlers
- [Infrastructure Layer](infrastructure-layer.md) - Repositories and persistence
