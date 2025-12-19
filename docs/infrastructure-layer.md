# Infrastructure Layer Documentation

This document describes the infrastructure layer, which provides technical capabilities including data persistence, external service integration, and mapping between domain and persistence models.

## Table of Contents

- [Overview](#overview)
- [Repositories](#repositories)
- [Mappers](#mappers)
- [Database Tables](#database-tables)
- [Database Configuration](#database-configuration)
- [TypeORM Integration](#typeorm-integration)

## Overview

The infrastructure layer provides technical implementations that support the domain and application layers. It is responsible for:

- **Data Persistence**: Storing and retrieving domain aggregates
- **Mapping**: Converting between domain models and persistence models
- **External Services**: Integrating with external systems
- **Technical Concerns**: Database connections, caching, etc.

**Location**: `src/singers/infrastructure/`

## Repositories

Repositories provide an abstraction over data persistence. They implement domain repository interfaces and handle the technical details of data access.

**Location**: `src/singers/infrastructure/db/`

### SingerRepository

**File**: `singer.repository.ts`

Implements both read and write repository interfaces:

```typescript
export class SingerRepository
  implements
    IDomainReadRepository<string, Singer>,
    IDomainWriteRepository<string, Singer>
```

#### Read Operations

**Find All**:
```typescript
async find(): Promise<Singer[]>
```
- Retrieves all singers with their songs
- Maps database tables to domain models

**Find By ID**:
```typescript
async findById(id: string): Promise<Singer>
```
- Retrieves a singer by ID
- Throws `DatabaseException` if not found or ID is invalid

**Exists**:
```typescript
async exists(fullName: string): Promise<boolean>
```
- Checks if a singer with the given full name exists
- Returns `true` if exists, `false` otherwise

#### Write Operations

**Insert**:
```typescript
async insert(singer: Singer): Promise<void>
```
- Inserts a new singer
- Validates that the singer is valid before insertion
- Throws `BrokenRulesException` if singer is invalid
- Throws `DatabaseException` on database errors

**Insert Batch**:
```typescript
async insertBatch(entities: Singer[]): Promise<void>
```
- Inserts multiple singers in a single operation
- More efficient for bulk operations

**Update**:
```typescript
async update(id: string, singer: Singer): Promise<void>
```
- Updates an existing singer
- Validates that the singer is valid before update
- Throws `DatabaseException` if singer not found
- Throws `BrokenRulesException` if singer is invalid

**Delete**:
```typescript
async delete(id: string): Promise<void>
```
- Deletes a singer by ID
- Hard delete operation

#### Song Operations

**Add Song**:
```typescript
async addSong(parent: Singer, song: Song): Promise<void>
```
- Adds a song to a singer
- Uses database transaction to ensure atomicity
- Saves both song and updated singer

**Remove Song**:
```typescript
async removeSong(parent: Singer, song: Song): Promise<void>
```
- Removes a song from a singer
- Uses database transaction
- Deletes the song record

### Repository Pattern Benefits

1. **Abstraction**: Domain layer doesn't know about database details
2. **Testability**: Easy to mock repositories for testing
3. **Flexibility**: Can swap implementations (SQLite, PostgreSQL, MongoDB, etc.)
4. **Consistency**: Enforces business rules before persistence

## Mappers

Mappers convert between domain models and persistence models (database tables).

**Location**: `src/singers/infrastructure/mappers/`

### SingerMapper

**File**: `singer.mapper.ts`

#### To Table (Domain → Database)

```typescript
static toTable(domain: Singer): SingerTable
```

Converts a `Singer` domain aggregate to a `SingerTable` database entity:

- Unpacks value objects to primitives
- Maps nested entities (songs)
- Converts audit information
- Handles optional fields

**Example**:
```typescript
const table = SingerMapper.toTable(singer);
// table is a SingerTable ready for database persistence
```

#### To Domain (Database → Domain)

```typescript
static toDomain(table: SingerTable): Singer
```

Converts a `SingerTable` database entity to a `Singer` domain aggregate:

- Creates value objects from primitives
- Maps nested entities (songs)
- Reconstructs domain events
- Sets tracking state to "dirty"

**Example**:
```typescript
const singer = SingerMapper.toDomain(table);
// singer is a Singer domain aggregate
```

### SongMapper

**File**: `song.mapper.ts`

Similar mapping operations for `Song` entity:

- `toTable(domain: Song): SongTable`
- `toDomain(table: SongTable): Song`

### Mapping Strategy

1. **Value Objects**: Unpack to primitives when persisting, create from primitives when loading
2. **Entities**: Map recursively for nested entities
3. **Audit**: Convert audit information between formats
4. **Tracking**: Set appropriate tracking state (new/dirty)

## Database Tables

Database tables are TypeORM entities that represent the persistence model.

**Location**: `src/singers/infrastructure/db/tables/`

### SingerTable

**File**: `singer.table.ts`

TypeORM entity representing the singers table:

```typescript
@Entity('singers')
export class Singer {
  @PrimaryColumn()
  id: string;

  @Column({ nullable: true })
  fullName: string;

  @Column({ nullable: true })
  picture: string;

  @CreateDateColumn()
  registerDate?: Date;

  @Column({ default: false })
  isSubscribed: boolean;

  @Column({ nullable: true })
  subscribedDate?: Date;

  @OneToMany(() => Song, (song) => song.singer)
  songs!: Song[];

  @Column({ nullable: true, default: 'registered' })
  status: string;

  @Column(() => Audit, { prefix: false })
  audit: Audit;
}
```

**Relationships**:
- One-to-Many with `Song` (a singer has many songs)

**Columns**:
- `id`: Primary key (UUID)
- `fullName`: Singer's full name
- `picture`: Picture URL or path
- `registerDate`: Registration date (auto-generated)
- `isSubscribed`: Subscription status
- `subscribedDate`: Subscription date
- `status`: Singer status (registered, subscribed, deleted)
- `audit`: Embedded audit information

### SongTable

**File**: `song.table.ts`

TypeORM entity representing the songs table:

```typescript
@Entity('songs')
export class Song {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => Singer, (singer) => singer.songs)
  singer: Singer;

  @Column()
  singerId: string;

  @Column({ default: 'active' })
  status: string;

  @Column(() => Audit, { prefix: false })
  audit: Audit;
}
```

**Relationships**:
- Many-to-One with `Singer` (many songs belong to one singer)

**Columns**:
- `id`: Primary key (UUID)
- `name`: Song name
- `singerId`: Foreign key to singers table
- `status`: Song status (active, publishing, published, inactive)
- `audit`: Embedded audit information

### AuditTable

**File**: `audit.table.ts`

Embedded entity for audit information:

```typescript
export class Audit {
  @Column({ nullable: true })
  createdBy?: string;

  @Column({ nullable: true })
  createdAt?: Date;

  @Column({ nullable: true })
  updatedBy?: string;

  @Column({ nullable: true })
  updatedAt?: Date;

  @Column({ nullable: true })
  timestamp?: number;
}
```

**Purpose**: Tracks who created/updated records and when.

## Database Configuration

### TypeORM Configuration

**Location**: `src/singers/singers.module.ts`

```typescript
TypeOrmModule.forRoot({
  type: 'sqlite',
  database: 'db/ddd.sql',
  synchronize: true,
  entities: [SingerTable, SongTable],
})
```

**Configuration Options**:
- **Type**: SQLite (for development)
- **Database**: File path `db/ddd.sql`
- **Synchronize**: Auto-sync schema (development only)
- **Entities**: Array of entity classes

### Production Considerations

For production, consider:

1. **Disable Synchronize**: Set `synchronize: false` and use migrations
2. **Use PostgreSQL/MySQL**: Replace SQLite with a production database
3. **Connection Pooling**: Configure connection pool settings
4. **SSL**: Enable SSL for secure connections
5. **Environment Variables**: Use environment variables for configuration

**Example Production Configuration**:
```typescript
TypeOrmModule.forRoot({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: false,
  entities: [SingerTable, SongTable],
  ssl: {
    rejectUnauthorized: false,
  },
})
```

## TypeORM Integration

### Module Registration

Repositories and entities are registered in the domain module:

```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([SingerTable, SongTable]),
    TypeOrmModule.forRoot({ ... }),
  ],
  providers: [
    ...singerRepository,
    // ... other providers
  ],
})
export class SingersModule {}
```

### Repository Injection

Repositories are injected using TypeORM's `@InjectRepository` decorator:

```typescript
@Injectable()
export class SingerRepository {
  constructor(
    @InjectRepository(SingerTable)
    readonly repository: Repository<SingerTable>,
    @InjectRepository(SongTable)
    readonly repositorySong: Repository<SongTable>,
  ) {}
}
```

### Transactions

Transactions are used for operations that must be atomic:

```typescript
async addSong(parent: Singer, song: Song): Promise<void> {
  await this.repository.manager.transaction(async (manager) => {
    await manager.save(SongTable, songTable);
    await manager.save(SingerTable, parentTable);
  });
}
```

## Error Handling

### DatabaseException

**Location**: `src/shared/exceptions/database.exception.ts`

Thrown when database operations fail:

```typescript
throw new DatabaseException('Singer ID cannot be empty');
throw new DatabaseException(`Singer with ID ${id} not found`);
```

### BrokenRulesException

**Location**: From `@nestjslatam/ddd-lib`

Thrown when trying to persist an invalid domain entity:

```typescript
if (!singer.IsValid) {
  throw new BrokenRulesException(
    `Cannot insert invalid singer: ${singer.BrokenRules.asString()}`,
  );
}
```

## Best Practices

1. **Repository Abstraction**: Keep domain layer independent of infrastructure
2. **Mapper Separation**: Use mappers to convert between layers
3. **Transaction Management**: Use transactions for atomic operations
4. **Error Handling**: Use appropriate exception types
5. **Validation**: Always validate domain entities before persistence
6. **Connection Management**: Let TypeORM manage connections
7. **Migration Strategy**: Use migrations in production, not synchronize

## Related Documentation

- [Architecture Overview](architecture.md) - Overall architecture
- [Domain Layer](domain-layer.md) - Domain models being persisted
- [Application Layer](application-layer.md) - How repositories are used
