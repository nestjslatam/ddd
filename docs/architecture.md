# Architecture

How this sample is laid out, and why. Every path and class name below exists in the repository — the previous version of this document described a `singers` module that never did.

## The four layers

```
┌──────────────────────────────────────────────────────┐
│  presentation/        controllers, HTTP DTOs         │
│    ↓ commands and queries                            │
├──────────────────────────────────────────────────────┤
│  application/         use cases, handlers, sagas     │
│    ↓ aggregates                                      │
├──────────────────────────────────────────────────────┤
│  domain/              aggregates, value objects,     │
│                       validators, domain events      │
│    ↑ contracts                                       │
├──────────────────────────────────────────────────────┤
│  infrastructure/      repository implementations     │
└──────────────────────────────────────────────────────┘
```

The arrow directions matter. `presentation` and `application` depend inwards on `domain`; `infrastructure` depends on `domain` too, by implementing interfaces the domain declares. **The domain depends on nothing** — not on Nest, not on a database, not on HTTP.

## Two bounded contexts

| | |
|---|---|
| **`src/products/`** | A `Product` aggregate: name, description, price, status. The simpler of the two — a good place to start reading. |
| **`src/orders/`** | An `Order` aggregate holding `OrderItem` entities, `CustomerInfo`, `ShippingAddress` and `Money`. Has a lifecycle: `DRAFT → CONFIRMED → PROCESSING → SHIPPED → DELIVERED`, with `CANCELLED` reachable from the first three. |
| **`src/shared/`** | What both use: the `Name`, `Description` and `Price` value objects, their validators, and `BrokenRulesException`. |

## Where a request goes

Take `POST /products`:

```
ProductsController.createProduct(dto)
  → CreateProductService.execute(dto)
      → CommandBus.execute(new CreateProductCommand(dto))
          → CreateProductCommandHandler.execute(command)
              → Name.create() / Description.create() / Price.create()
              → Product.create(name, description, price)
              → if (!product.isValid) throw new BrokenRulesException(...)
              → productRepository.save(product)
              → publisher.mergeObjectContext(product).commit()
```

Three things in that chain are worth pausing on.

**`Product.create` checks `isValid` itself.** The library *collects* broken rules rather than throwing, so a factory that skips the check returns an object that failed its own invariants. This is the single easiest mistake to make with `@nestjslatam/ddd-lib`.

**`isValid` is a getter.** Since `ddd-lib` 3.0.0 it is a getter on every base. Written as `isValid()` it is a compile error; read as a property on an older version it is an always-truthy `Function`, which is how a guard here silently never fired for two releases.

**`mergeObjectContext(...).commit()` is what dispatches domain events.** An aggregate *collects* its events; without that call the command succeeds, returns cleanly, and every `@EventsHandler` is skipped in silence.

## Validation happens in two places, on purpose

| | Where | Answers with |
|---|---|---|
| **Structure** | The DTO's `class-validator` decorators, checked by the global `ValidationPipe` | `400`, naming the field |
| **Invariants** | The aggregate's validators, collected as broken rules | `422`, listing the rules |

A wrong *type* never reaches the domain. A wrong *value* is meaning, and only the aggregate can judge it. `DomainExceptionFilter` in `src/shared/filters/` maps the domain's exception vocabulary onto status codes — see [the README](../README.md#the-sample-application) for the full table.

The DTOs deliberately do **not** restate domain rules. `Name` owns "3 to 100 characters" and `Price` owns "greater than zero", in validators the aggregate enforces whatever transport the data arrived on.

## Validators are classes, and conditions read backwards

```ts
export class ProductPriceValidator extends AbstractRuleValidator<Product> {
  public addRules(): void {
    if (this.subject.props.price.getValue() <= 0) {
      this.addBrokenRule('props.price', 'Price must be greater than 0');
    }
  }
}
```

`addRules` records what is **wrong**, so every condition is the negation of the assertion you have in mind. Getting this backwards produces a validator that passes exactly when it should fail.

An aggregate registers them in `addValidators`; a value object does the same but **must call `super.addValidators()` first** — the base registers real rules there, and an override that does not chain drops them silently.

## Persistence is absent on purpose

The repositories under `src/*/infrastructure/repositories/` are in-memory. The sample is about the domain, not about a database: implement `IDomainWriteRepository` against your own store and nothing above it changes. That is the point of the dependency direction at the top of this page.

## Further reading

- [Domain layer](domain-layer.md) — aggregates, value objects, validators, events
- [Application layer](application-layer.md) — use cases, handlers, queries
- [Infrastructure layer](infrastructure-layer.md) — repositories
- [API reference](api-reference.md) — every endpoint
- [Getting started](getting-started.md) — run it
