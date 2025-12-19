# Application Layer Documentation

This document describes the application layer, which orchestrates domain operations using the CQRS pattern.

## Table of Contents

- [Overview](#overview)
- [CQRS Pattern](#cqrs-pattern)
- [Commands](#commands)
- [Command Handlers](#command-handlers)
- [Queries](#queries)
- [Query Handlers](#query-handlers)
- [Sagas](#sagas)
- [Event Handlers](#event-handlers)
- [DTOs](#dtos)
- [Base Classes](#base-classes)

## Overview

The application layer orchestrates domain operations and coordinates use cases. It does not contain business logic but rather coordinates the domain layer to fulfill application use cases.

**Location**: `src/singers/application/`

## CQRS Pattern

**CQRS (Command Query Responsibility Segregation)** separates read and write operations:

- **Commands**: Modify domain state (write operations)
- **Queries**: Retrieve data without side effects (read operations)

This separation allows:
- Independent scaling of read and write operations
- Different models for reading and writing
- Clear separation of concerns

## Commands

Commands represent write operations that modify domain state.

**Location**: `src/singers/application/use-cases/commands/`

### Command Structure

Commands implement the `ICommand` interface from `@nestjs/cqrs`:

```typescript
export class CreateSingerCommand implements ICommand {
  constructor(
    public readonly fullName: string,
    public readonly picture: string,
    public readonly trackingId?: string,
  ) {}
}
```

### Available Commands

#### CreateSingerCommand

**File**: `create-singer/create-singer.command.ts`

Creates a new singer.

**Properties**:
- `fullName: string` - Singer's full name
- `picture: string` - Picture URL or path
- `trackingId?: string` - Optional tracking ID

**Controller**: `CreateSingerController`
**Handler**: `CreateSingerCommandHandler`

#### ChangeFullNameSingerCommand

**File**: `change-fullname-singer/change-fullname-singer.command.ts`

Changes a singer's full name.

**Properties**:
- `id: string` - Singer ID
- `fullName: string` - New full name

**Controller**: `ChangeFullNameSingerController`
**Handler**: `ChangeFullNameSingerCommandHandler`

#### ChangePictureSingerCommand

**File**: `change-picture-singer/change-picture-singer.command.ts`

Changes a singer's picture.

**Properties**:
- `id: string` - Singer ID
- `picture: string` - New picture URL or path

**Controller**: `ChangePictureSingerController`
**Handler**: `ChangePictureSingerCommandHandler`

#### SubscribeSingerCommand

**File**: `subscribe-singer/susbcribe-singer.command.ts`

Subscribes a singer.

**Properties**:
- `id: string` - Singer ID

**Controller**: `SubscribeSingerController`
**Handler**: `SubscribeSingerCommandHandler`

#### RemoveSingerCommand

**File**: `remove-singer/remove-singer.command.ts`

Removes (soft deletes) a singer.

**Properties**:
- `id: string` - Singer ID

**Controller**: `RemoveSingerController`
**Handler**: `RemoveSingerCommandHandler`

#### AddSongSingerCommand

**File**: `add-song-singer/add-song-singer.command.ts`

Adds a song to a singer.

**Properties**:
- `singerId: string` - Singer ID
- `songName: string` - Song name

**Controller**: `AddSongSingerController`
**Handler**: `AddSongSingerCommandHandler`

#### RemoveSongSingerCommand

**File**: `remove-song-singer/remove-song-singer.command.ts`

Removes a song from a singer.

**Properties**:
- `singerId: string` - Singer ID
- `songId: string` - Song ID

**Controller**: `RemoveSongSingerController`
**Handler**: `RemoveSongSingerCommandHandler`

## Command Handlers

Command handlers execute commands and modify domain state.

**Location**: `src/singers/application/use-cases/commands/*/command-handler.ts`

### Base Class

All command handlers extend `AbstractCommandHandler`:

**File**: `src/shared/application/commands/command-handler.base.ts`

```typescript
export abstract class AbstractCommandHandler<TCommand>
  implements ICommandHandler<TCommand>
{
  constructor(protected readonly eventBus?: DomainEventBus) {}

  abstract execute(command: TCommand): Promise<void>;

  checkBusinessRules(domain: DomainEntity<any>): void {
    if (!domain.IsValid) {
      throw new DomainException(domain.BrokenRules.asString());
    }
  }

  publish(domain: DomainAggregateRoot<any>): void {
    const events = domain.commit();
    this.eventBus.publishAll(events);
  }
}
```

### Handler Responsibilities

1. **Validate Input**: Check if the command is valid
2. **Load Aggregate**: Retrieve the aggregate from the repository
3. **Execute Domain Operation**: Call domain methods
4. **Check Business Rules**: Validate domain state
5. **Persist Changes**: Save to repository
6. **Publish Events**: Publish domain events

### Example: CreateSingerCommandHandler

```typescript
@CommandHandler(CreateSingerCommand)
export class CreateSingerCommandHandler 
  extends AbstractCommandHandler<CreateSingerCommand> {
  
  constructor(
    protected readonly repository: SingerRepository,
    protected readonly eventBus: DomainEventBus,
  ) {
    super(eventBus);
  }

  async execute(command: CreateSingerCommand): Promise<void> {
    const { fullName, picture } = command;

    // Check if singer already exists
    if (await this.repository.exists(fullName))
      throw new ApplicationException(
        `Singer with name ${fullName} already exists`,
      );

    // Create domain aggregate
    const singer = Singer.create({
      fullName: FullName.create(fullName),
      picture: PicturePath.create(picture),
      registerDate: RegisterDate.create(new Date()),
      isSubscribed: false,
      status: eSingerStatus.Registered,
      audit: DomainAudit.create({
        createdBy: MetaRequestContextService.getUser(),
        createdAt: DateTimeHelper.getUtcDate(),
      }),
    });

    // Validate business rules
    this.checkBusinessRules(singer);

    // Persist
    await this.repository.insert(singer);

    // Publish domain events
    this.publish(singer);
  }
}
```

## Queries

Queries represent read operations that retrieve data without modifying state.

**Location**: `src/singers/application/use-cases/queries/`

### Query Structure

Queries implement the `IQuery` interface from `@nestjs/cqrs`:

```typescript
export class GetSingerByIdQuery implements IQuery {
  constructor(public readonly id: string) {}
}
```

### Available Queries

#### GetSingerByIdQuery

**File**: `get-singer-byId/get-singer-byId.query.ts`

Retrieves a singer by ID.

**Properties**:
- `id: string` - Singer ID

**Controller**: `GetSingerByIdController`
**Handler**: `GetSingerByIdQueryHandler`

#### GetSingersCriteriaQuery

**File**: `get-singers-criteria/get-singers-criteria.query.ts`

Retrieves singers based on criteria (pagination, filters).

**Properties**:
- `page: number` - Page number
- `pageSize: number` - Items per page
- `filters?: object` - Optional filters

**Controller**: `GetSingersCriteriaController`
**Handler**: `GetSingersCriteriaQueryHandler`

## Query Handlers

Query handlers execute queries and return data.

**Location**: `src/singers/application/use-cases/queries/*/query-handler.ts`

### Example: GetSingerByIdQueryHandler

```typescript
@QueryHandler(GetSingerByIdQuery)
export class GetSingerByIdQueryHandler implements IQueryHandler {
  constructor(private readonly singersRepository: SingerRepository) {}

  async execute(query: GetSingerByIdQuery): Promise<SingerTable> {
    const { id } = query;

    const singer = await this.singersRepository.findById(id);

    if (!singer) {
      throw new Error('Singer not found');
    }

    return SingerMapper.toTable(singer);
  }
}
```

### Query Handler Responsibilities

1. **Load Data**: Retrieve data from repository
2. **Transform**: Map domain models to DTOs or tables
3. **Return**: Return the requested data

## Sagas

Sagas are long-running processes that listen to domain events and may trigger new commands.

**Location**: `src/singers/application/sagas/`

### SystemSagas

**File**: `system.saga.ts`

Example saga that listens to `SingerCreatedDomainEvent`:

```typescript
@Injectable()
export class SystemSagas {
  @Saga()
  systemCreated = (events$: Observable<any>): Observable<void> => {
    return events$.pipe(
      ofType(SingerCreatedDomainEvent),
      map((event) => console.log('Singer created listened from SAGA: ', event)),
    );
  };
}
```

### Saga Characteristics

- **Event-Driven**: Listen to domain events
- **Reactive**: Use RxJS for event stream processing
- **Coordination**: May trigger new commands
- **Long-Running**: Can span multiple transactions

### Saga Use Cases

- Send welcome email when user registers
- Update read models when aggregate changes
- Coordinate complex workflows across aggregates
- Trigger external system integrations

## Event Handlers

Event handlers react to domain events.

**Location**: `src/singers/application/use-cases/commands/*/created-*.domainevent-handler.ts`

### Example: CreatedSingerDomainEventHandler

**File**: `create-singer/created-singer.domainevent-handler.ts`

```typescript
@EventsHandler(SingerCreatedDomainEvent)
export class CreatedSingerDomainEventHandler
  implements IEventHandler<SingerCreatedDomainEvent>
{
  async handle(event: SingerCreatedDomainEvent): Promise<void> {
    // React to the event
    // e.g., send notification, update read model, etc.
  }
}
```

### Event Handler Responsibilities

1. **React to Events**: Handle domain events
2. **Update Read Models**: Update denormalized views
3. **Send Notifications**: Trigger external notifications
4. **Integrate**: Call external systems

## DTOs

Data Transfer Objects (DTOs) are used for data transfer between layers.

**Location**: `src/singers/application/use-cases/*/*.dto.ts`

### DTO Structure

DTOs use class-validator decorators for validation:

```typescript
export class CreateSingerDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  picture: string;

  @IsString()
  @IsOptional()
  trackingId?: string;
}
```

### Validation

DTOs are validated using NestJS `ValidationPipe`:

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    transform: true,
    whitelist: true,
    exceptionFactory: (errors) => {
      const result = errors.map((error) => ({
        property: error.property,
        message: error.constraints[Object.keys(error.constraints)[0]],
      }));
      return new BadRequestException(result);
    },
    stopAtFirstError: true,
  }),
);
```

## Controllers

Controllers handle HTTP requests and dispatch commands/queries.

**Location**: `src/singers/application/use-cases/*/*.controller.ts`

### Command Controllers

Command controllers receive HTTP requests and dispatch commands:

```typescript
@Controller('singers')
export class CreateSingerController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  async create(@Body() createSingerDto: CreateSingerDto): Promise<void> {
    const { fullName, picture, trackingId } = createSingerDto;

    return await this.commandBus.execute(
      new CreateSingerCommand(fullName, picture, trackingId),
    );
  }
}
```

### Query Controllers

Query controllers receive HTTP requests and dispatch queries:

```typescript
@Controller('singers')
export class GetSingerByIdController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get(':id')
  async getById(@Param('id') id: string): Promise<SingerTable> {
    return await this.queryBus.execute(new GetSingerByIdQuery(id));
  }
}
```

## Base Classes

### AbstractCommandHandler

**File**: `src/shared/application/commands/command-handler.base.ts`

Base class for all command handlers providing:

- **checkBusinessRules()**: Validates domain entity business rules
- **publish()**: Publishes domain events from aggregate

## Request Context

The application uses request context to track user information across the request lifecycle.

**Location**: `src/shared/application/context/`

### MetaRequestContextService

Provides access to request context:

```typescript
MetaRequestContextService.getUser()  // Get current user
```

### MetaRequestContextInterceptor

Intercepts requests and populates context.

## Best Practices

1. **Thin Application Layer**: Keep application layer thin, delegate to domain
2. **Validate Input**: Validate DTOs at the controller level
3. **Check Business Rules**: Always validate business rules before persisting
4. **Publish Events**: Publish domain events after successful operations
5. **Handle Errors**: Use appropriate exception types
6. **Use DTOs**: Use DTOs for data transfer, not domain models
7. **Separate Commands and Queries**: Keep commands and queries separate

## Related Documentation

- [Architecture Overview](architecture.md) - Overall architecture
- [Domain Layer](domain-layer.md) - Domain models used by handlers
- [Infrastructure Layer](infrastructure-layer.md) - Repositories used by handlers
