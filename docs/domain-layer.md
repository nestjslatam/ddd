# Domain Layer Documentation

This document describes the domain layer of the application, including aggregate roots, entities, value objects, domain events, and business rules.

## Table of Contents

- [Overview](#overview)
- [Aggregate Roots](#aggregate-roots)
- [Entities](#entities)
- [Value Objects](#value-objects)
- [Domain Events](#domain-events)
- [Business Rules](#business-rules)
- [Shared Domain Primitives](#shared-domain-primitives)

## Overview

The domain layer is the heart of the application, containing all business logic and domain models. It is completely independent of infrastructure and application concerns.

**Location**: `src/singers/domain/` and `src/shared/domain/`

## Aggregate Roots

### Singer Aggregate

**File**: `src/singers/domain/singer.ts`

The `Singer` aggregate root manages singers and their songs. It enforces business rules and maintains consistency within its boundary.

#### Properties

```typescript
interface ISingerProps {
  fullName: FullName;              // Value object
  picture?: PicturePath;           // Value object
  registerDate: RegisterDate;      // Value object
  isSubscribed: boolean;
  subscribedDate?: SubscribedDate;  // Value object
  songs?: Song[];                  // Entities within aggregate
  status: eSingerStatus;           // Enum: Registered, Subscribed, Deleted
  audit: DomainAudit;              // Audit information
}
```

#### Status Enum

```typescript
enum eSingerStatus {
  Registered = 'registered',
  Subscribed = 'subscribed',
  Deleted = 'deleted',
}
```

#### Factory Methods

**Create a new singer**:
```typescript
static create(props: ISingerProps): Singer
```

**Map from database**:
```typescript
static mapFromRaw(props: ISingerRaw): Singer
```

#### Domain Operations

**Change Full Name**:
```typescript
changeFullName(fullName: FullName, audit: DomainAudit): this
```
- Updates the singer's full name
- Updates audit information
- Marks aggregate as dirty

**Change Picture**:
```typescript
changePicture(picture: PicturePath, audit: DomainAudit): this
```
- Updates the singer's picture path
- Updates audit information

**Subscribe**:
```typescript
subscribe(audit: DomainAudit): this
```
- Sets `isSubscribed` to `true`
- Creates `SubscribedDate`
- Updates status to `Subscribed`
- Publishes `SingerSubscribedDomainEvent`
- **Business Rule**: Cannot subscribe if already subscribed

**Remove**:
```typescript
remove(audit: DomainAudit): this
```
- Sets status to `Deleted`
- Publishes `SingerDeletedDomainEvent`
- **Business Rule**: Cannot remove if subscribed

**Add Song**:
```typescript
addSong(song: Song, audit: DomainAudit): this
```
- Adds a song to the singer's collection
- Updates audit information

**Remove Song**:
```typescript
removeSong(song: Song, audit: DomainAudit): this
```
- Removes a song from the singer's collection
- Updates audit information

#### Business Rules

The `Singer` aggregate enforces the following business rules:

1. **Subscription Rule**: If a singer is subscribed, a subscribed date is required
2. **Double Subscription Rule**: A singer cannot subscribe if already subscribed
3. **Removal Rule**: A subscribed singer cannot be removed

```typescript
protected businessRules(props: ISingerProps): void {
  if (props.isSubscribed && !props.subscribedDate)
    this.addBrokenRule(
      new BrokenRule(
        'singer',
        'if singer is subscribed, subscribed date is required',
      ),
    );
}
```

#### Domain Events

The `Singer` aggregate publishes the following events:

- **SingerCreatedDomainEvent**: When a new singer is created
- **SingerSubscribedDomainEvent**: When a singer subscribes
- **SingerDeletedDomainEvent**: When a singer is deleted

## Entities

### Song Entity

**File**: `src/singers/domain/song.ts`

The `Song` entity represents a song within the `Singer` aggregate. It is not an aggregate root but belongs to the `Singer` aggregate.

#### Properties

```typescript
interface ISongProps {
  singerId: Id;                   // Reference to parent aggregate
  name: Name;                      // Value object
  status: eSongStatus;             // Enum: ACTIVE, PUBLISHING, PUBLISHED, INACTIVE
  audit: DomainAudit;              // Audit information
}
```

#### Status Enum

```typescript
enum eSongStatus {
  ACTIVE = 'active',
  PUBLISHING = 'publishing',
  PUBLISHED = 'published',
  INACTIVE = 'inactive',
}
```

#### Factory Methods

**Create a new song**:
```typescript
static create(singerId: Id, name: Name, audit: DomainAudit): Song
```

**Map from database**:
```typescript
static fromRaw(props: ISongRaw): Song
```

#### Business Rules

The `Song` entity enforces:

1. **Name Required**: Song name must be provided
2. **Status Validation**: Song cannot be inactive

```typescript
protected businessRules(props: ISongProps): void {
  const { name, status } = props;

  if (!name) {
    this.addBrokenRule(new BrokenRule('name', 'Name is required'));
  }

  if (status === eSongStatus.INACTIVE) {
    this.addBrokenRule(new BrokenRule('status', 'Status is inactive'));
  }
}
```

## Value Objects

Value objects are immutable objects defined by their attributes. They provide type safety and encapsulate validation logic.

### Domain-Specific Value Objects

**Location**: `src/singers/domain/`

#### FullName

**File**: `src/singers/domain/fullname-field.ts`

Represents a singer's full name.

```typescript
export class FullName extends AbstractDomainString {
  static create(value: string): FullName
  unpack(): string
}
```

#### PicturePath

**File**: `src/singers/domain/picture-field.ts`

Represents a picture URL or path.

```typescript
export class PicturePath extends AbstractDomainString {
  static create(value: string): PicturePath
  unpack(): string
}
```

### Shared Value Objects

**Location**: `src/shared/domain/`

#### Id

**File**: `src/shared/domain/id.ts`

Represents a unique identifier (UUID).

```typescript
export class Id extends DomainIdAsString {
  static create(): Id                    // Generates new UUID
  static fromRaw(value: string): Id     // Creates from existing UUID
  unpack(): string
}
```

#### Name

**File**: `src/shared/domain/name.ts`

Represents a name value object.

```typescript
export class Name extends AbstractDomainString {
  static create(value: string): Name
  unpack(): string
}
```

#### RegisterDate

**File**: `src/shared/domain/register-date.ts`

Represents a registration date.

```typescript
export class RegisterDate extends AbstractDomainDate {
  static create(value: Date): RegisterDate
  unpack(): Date
}
```

#### SubscribedDate

**File**: `src/shared/domain/subscribed-date.ts`

Represents a subscription date.

```typescript
export class SubscribedDate extends AbstractDomainDate {
  static create(value: Date): SubscribedDate
  unpack(): Date
}
```

#### Url

**File**: `src/shared/domain/url.ts`

Represents a URL value object.

```typescript
export class Url extends AbstractDomainString {
  static create(value: string): Url
  unpack(): string
}
```

## Domain Events

Domain events represent something that happened in the domain that domain experts care about.

**Location**: `src/singers/domain/events/`

### SingerCreatedDomainEvent

**File**: `src/singers/domain/events/singer-created.domainevent.ts`

Published when a new singer is created.

```typescript
export class SingerCreatedDomainEvent extends DomainEvent {
  constructor(
    readonly singerId: string,
    readonly singerName: string,
  )
  
  toRaw(): {
    singerId: string;
    singerName: string;
    status: string;
  }
}
```

**Properties**:
- `singerId`: The ID of the created singer
- `singerName`: The full name of the created singer

### SingerSubscribedDomainEvent

**File**: `src/singers/domain/events/singer-subscribed.domainevent.ts`

Published when a singer subscribes.

```typescript
export class SingerSubscribedDomainEvent extends DomainEvent {
  constructor(
    readonly singerId: string,
    readonly subscribedDate: Date,
  )
}
```

**Properties**:
- `singerId`: The ID of the subscribed singer
- `subscribedDate`: The date when the singer subscribed

### SingerDeletedDomainEvent

**File**: `src/singers/domain/events/singer-deleted.domainevent.ts`

Published when a singer is deleted.

```typescript
export class SingerDeletedDomainEvent extends DomainEvent {
  constructor(
    readonly singerId: string,
    readonly singerName: string,
  )
}
```

**Properties**:
- `singerId`: The ID of the deleted singer
- `singerName`: The full name of the deleted singer

## Business Rules

Business rules are invariants that must always be true. They are enforced at the domain level through the `businessRules()` method.

### Singer Business Rules

1. **Subscription Date Rule**: If `isSubscribed` is `true`, then `subscribedDate` must be provided
2. **Double Subscription Rule**: A singer cannot subscribe if already subscribed
3. **Removal Rule**: A subscribed singer cannot be removed

### Song Business Rules

1. **Name Required**: Song name must be provided
2. **Status Validation**: Song status cannot be `INACTIVE`

### Validation Flow

1. Domain operation is called (e.g., `singer.subscribe()`)
2. Business rules are checked in `businessRules()` method
3. Broken rules are collected using `addBrokenRule()`
4. Before persistence, `IsValid` property is checked
5. If invalid, a `DomainException` is thrown with all broken rules

## Shared Domain Primitives

The shared module provides reusable domain primitives that can be used across different domain modules.

**Location**: `src/shared/domain/`

### Available Primitives

- **Id**: Unique identifier (UUID)
- **Name**: Name value object
- **RegisterDate**: Registration date
- **SubscribedDate**: Subscription date
- **Url**: URL value object

These primitives extend base classes from `@nestjslatam/ddd-lib`:
- `DomainIdAsString`
- `AbstractDomainString`
- `AbstractDomainDate`

## Best Practices

1. **Keep Domain Pure**: Domain layer should not depend on frameworks
2. **Use Value Objects**: Prefer value objects over primitives
3. **Enforce Business Rules**: All business rules should be in the domain
4. **Immutable Value Objects**: Value objects should be immutable
5. **Rich Domain Models**: Domain models should contain behavior, not just data
6. **Publish Events**: Use domain events to communicate between aggregates
7. **Validate Early**: Validate business rules in the domain layer

## Related Documentation

- [Architecture Overview](architecture.md) - Overall architecture
- [Application Layer](application-layer.md) - How domain is used in application layer
- [Infrastructure Layer](infrastructure-layer.md) - How domain is persisted
