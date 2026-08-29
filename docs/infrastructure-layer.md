# Infrastructure layer

Where the domain meets everything outside it. In this sample that is two repositories and an exception filter — deliberately little.

## Persistence is absent on purpose

`src/products/infrastructure/repositories/product.repository.ts` and its Orders counterpart keep aggregates **in memory**. There is no database, no ORM, no migration, no `docker-compose`.

That is the point. A sample with a real store spends most of its lines on the store, and a reader learning DDD ends up reading persistence code. Here the repository is small enough to read in a minute, and swapping it changes nothing above it.

An earlier revision of this document described a TypeORM setup. It was removed in `2.1.0` — along with `typeorm`, `@nestjs/typeorm` and `pg`, none of which any source file imported.

## The contract

`@nestjslatam/ddd-lib` declares two interfaces, split by direction:

```ts
IDomainReadRepository     // findById, findAll, exists
IDomainWriteRepository    // save, delete
```

The split is not ceremony. A read model can grow its own shape without dragging write concerns along, which is the same reason queries in the [application layer](application-layer.md) have DTOs of their own.

```ts
@Injectable()
export class ProductRepository {
  private readonly products = new Map<string, Product>();

  async save(product: Product): Promise<void> { /* … */ }
  async findById(id: string): Promise<Product | null> { /* … */ }
  async findAll(): Promise<Product[]> { /* … */ }
  async delete(id: string): Promise<void> { /* … */ }
  async exists(id: string): Promise<boolean> { /* … */ }
}
```

## Writing your own

Implement the same methods against your store. Nothing in `domain/` or `application/` changes, because nothing there knows the repository exists beyond its interface — that is what the dependency direction in [Architecture](architecture.md) buys you.

Two things worth doing when you do:

**Read the tracking state.** Every aggregate carries one — `isNew`, `isDirty`, `isDeleted`. A repository can read it to choose between an insert, an update and a delete without being told which. `save()` becoming a single entry point is the payoff.

**Rehydrate with `load()`, not `create()`.** Both `Product` and `Order` expose both. `create()` validates, because it is building something new; `load()` does not, because what came out of your store was already valid when it went in. Running the factory on read means an invariant that changed later can make historical rows unreadable.

## The exception filter

`src/shared/filters/domain-exception.filter.ts` is the other piece of infrastructure here: it translates the domain's exception vocabulary into HTTP status codes, so a broken invariant is a `422` naming the rules rather than a bare `500`.

It is infrastructure precisely because it is the only place that knows both the domain's exceptions and HTTP. The domain raises `BrokenRulesException`; it has no idea what a status code is. See [the README](../README.md#the-sample-application) for the mapping table.

Anything that is **not** a domain exception is deliberately left as a `500` — dressing an unexpected fault as a client error hides it.

## What is not here

No cache, no message broker, no outbox. The domain events in this sample are dispatched in-process by `@nestjs/cqrs`. If you need them to survive a restart, that is what [`@nestjslatam/ddd-es-lib`](https://github.com/nestjslatam/ddd-event-sourcing) is for.

## Next

- [Architecture](architecture.md) — why the dependencies point this way
- [Application layer](application-layer.md) — who calls `save()`
