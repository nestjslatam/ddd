# @nestjslatam/ddd-lib

Domain-Driven Design building blocks for NestJS: aggregate roots, value objects, rule validators that collect broken rules instead of throwing, and change tracking.

[![npm](https://img.shields.io/npm/v/%40nestjslatam%2Fddd-lib.svg)](https://www.npmjs.com/package/@nestjslatam/ddd-lib) [![CI](https://github.com/nestjslatam/ddd/actions/workflows/ci.yml/badge.svg)](https://github.com/nestjslatam/ddd/actions/workflows/ci.yml) [![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/nestjslatam/ddd/blob/main/LICENSE)

> [!WARNING]
> **Under active development.** `@nestjslatam/ddd-lib@2.1.2` is not recommended for production use. The public API is not stable and breaking changes can land in any minor release. Pin an exact version and read the [changelog](../../CHANGELOG.md) before upgrading.

```bash
npm install @nestjslatam/ddd-lib
```

```typescript
import { AbstractRuleValidator, NumberValueObject } from '@nestjslatam/ddd-lib';

class PriceRangeValidator extends AbstractRuleValidator<Price> {
  public addRules(): void {
    if (this.subject.getValue() > 9_999_999.99) {
      this.addBrokenRule('value', 'Price exceeds the maximum allowed');
    }
  }
}

export class Price extends NumberValueObject {
  static create(value: number): Price {
    return new Price(value);
  }

  override addValidators(): void {
    super.addValidators();
    this.validatorRules.add(new PriceRangeValidator(this));
  }
}

const price = Price.create(-1);

price.isValid; // false
price.brokenRules.getBrokenRulesAsString();
// 'Property: value, Message: value must be a positive number (greater than zero)'
```

Constructing a value object never throws for a business-rule failure. It runs the validators, stores what failed on `brokenRules`, and hands you the object. Deciding what to do with an invalid object is your factory's job — the library will not make it for you.

`NumberValueObject` brings its own validators: by default a number must be finite, non-`NaN` and strictly positive, so `-1` above is rejected before `PriceRangeValidator` is even consulted. Pass options to loosen that — `NumberValueObject.create(0, { allowZero: true })`, or `{ requirePositive: false }` for values that may go negative.

## The ecosystem

Four packages, published by [NestJS LATAM](https://github.com/nestjslatam). Each is usable on its own; `ddd-lib` is the base the other three build on.

| Package | What it is |
|---|---|
| **`@nestjslatam/ddd-lib`** | The DDD building blocks — aggregates, value objects, validators, broken rules, state tracking. Source in [nestjslatam/ddd](https://github.com/nestjslatam/ddd). — you are here |
| [`@nestjslatam/ddd-cli`](https://www.npmjs.com/package/@nestjslatam/ddd-cli) | A CLI for working with the library: understand it, scaffold any stereotype, extend it, audit your code. Usable directly or from an AI agent over MCP. Source in [nestjslatam/ddd-cli](https://github.com/nestjslatam/ddd-cli). |
| [`@nestjslatam/ddd-valueobjects`](https://www.npmjs.com/package/@nestjslatam/ddd-valueobjects) | Ready-made value objects — email, phone number, money, date range, document id — built on `ddd-lib`. Source in [nestjslatam/ddd-valueobjects](https://github.com/nestjslatam/ddd-valueobjects). |
| [`@nestjslatam/ddd-es-lib`](https://www.npmjs.com/package/@nestjslatam/ddd-es-lib) | Event sourcing for `ddd-lib`: event store, snapshots, upcasting, sagas, materialised views. Source in [nestjslatam/ddd-event-sourcing](https://github.com/nestjslatam/ddd-event-sourcing). |

## Requirements

- Node.js `>=20.11`.
- Peer dependencies you must install yourself: `@nestjs/common` and `@nestjs/core` (`^10 || ^11`), `@nestjs/cqrs` (`^10 || ^11`), `reflect-metadata` (`^0.1.13 || ^0.2.0`), `rxjs` (`^7.2.0`).
- `@nestjs/cqrs` is not optional. `DddAggregateRoot` extends its `AggregateRoot`, so the import fails without it.
- One bundled runtime dependency: `uuid@^11`, used by `IdValueObject`.
- The package ships compiled JavaScript with `.d.ts` files. No build step, no `tsconfig` path mapping.

## Collecting broken rules instead of throwing

```typescript
import { AbstractRuleValidator } from '@nestjslatam/ddd-lib';

class OrderTotalValidator extends AbstractRuleValidator<Order> {
  public addRules(): void {
    if (this.subject.props.total.getValue() > 10_000) {
      this.addBrokenRule('total', 'Orders over 10,000 need manual approval');
    }
  }
}

order.brokenRules.getBrokenRules();
// [{ property: 'total', message: 'Orders over 10,000 need manual approval', severity: 'Error' }]
```

A validator extends `AbstractRuleValidator<TSubject>`, receives the object it validates as `subject`, and calls `addBrokenRule(property, message)` for each failure. It never throws and never returns a boolean, so one pass reports every problem rather than the first one.

The failures land in a `BrokenRulesManager`, reachable as `brokenRules` on both value objects and aggregates. `getBrokenRules()` returns the `BrokenRule` list, `getBrokenRulesAsString()` formats it for a log line, and `hasErrors()` answers the yes-or-no question. Rules are deduplicated case-insensitively on property plus message, so registering the same validator twice does not double the output.

> [!IMPORTANT]
> `isValid` is a **getter** on value objects and a **method** on aggregates. `if (!valueObject.isValid)` is right; `if (!aggregate.isValid)` tests a function object, is always false, and silently passes every invalid aggregate. Write `if (!aggregate.isValid())`.

## Building an aggregate root

```typescript
import {
  AbstractRuleValidator,
  DddAggregateRoot,
  IdValueObject,
  StringValueObject,
  ValidatorRuleManager,
} from '@nestjslatam/ddd-lib';

interface OrderProps {
  customer: StringValueObject;
  total: Price;
}

export class Order extends DddAggregateRoot<Order, OrderProps> {
  private constructor(props: OrderProps, id?: IdValueObject) {
    super(props, { id });
  }

  static create(customer: StringValueObject, total: Price): Order {
    return new Order({ customer, total });
  }

  protected override addValidators(
    manager: ValidatorRuleManager<AbstractRuleValidator<Order>>,
  ): void {
    manager.add(new OrderTotalValidator(this));
  }
}

const order = Order.create(StringValueObject.create('ACME'), Price.create(12_000));

order.isValid(); // false
order.id; // IdValueObject, generated when none is passed
```

`DddAggregateRoot` takes two type parameters and an optional third: `DddAggregateRoot<TEntity, TProps, TState extends object = object>`. `TEntity` is the aggregate itself and exists so validators are typed against it; `TProps` is the state. Passing one parameter does not compile.

The constructor takes `props` and an options object. Give it `id` to reconstitute an aggregate you loaded from a database, and `skipInitialValidation: true` to skip the validation pass that otherwise runs during construction — persisted data has already been through it once. Override `guard()` for technical integrity checks that should throw, and `addValidators(manager)` for business rules that should be collected.

## Tracking what changed

```typescript
order.trackingState.isNew; // true after construction
order.trackingState.isDirty; // true once a setter marks it
order.trackingState.markAsClean(); // after a successful save
```

Every aggregate and value object owns a `TrackingStateManager`, exposed as `trackingState`. It reports `isNew`, `isDirty`, `isDeleted` and `isSelfDeleted`, and it is moved with `markAsNew()`, `markAsDirty()`, `markAsClean()`, `markAsDeleted()` and `markAsSelfDeleted()`.

Value objects mark themselves dirty on their own: `setValue()` fires the property-change notification, which flips the state and re-runs validation. Aggregates do not — the library cannot know that assigning `this.props.total` was a domain change, so your mutator calls `this.trackingState.markAsDirty()` itself. `propsCopy` bundles id, props and tracking state for handing data out, but read its name carefully: `Object.freeze` is applied to the wrapper only, and `props` inside it is the live object, so writing through it still mutates the aggregate.

## Emitting domain events

```typescript
import {
  DomainEvent,
  EventMetadata,
  EventMetadataBuilder,
} from '@nestjslatam/ddd-lib';

export class OrderConfirmed extends DomainEvent {
  constructor(
    public readonly orderId: string,
    metadata: EventMetadata,
  ) {
    super(metadata);
  }
}

const metadata = EventMetadataBuilder.create(order.id.toString(), 'Order', 0)
  .withCorrelationId('req-42')
  .build();

new OrderConfirmed(order.id.toString(), metadata).toJSON();
// { eventId, eventType: 'OrderConfirmed', eventVersion: 1, occurredOn, metadata, data: { orderId } }
```

The base class is `DomainEvent`, also exported under the alias `AbstractDomainEvent`. It stamps `eventId`, `occurredOn`, `eventType` (from the constructor name) and `eventVersion`, and it rejects metadata that is missing `aggregateId` or `aggregateType`, so a malformed event fails at construction rather than at replay.

`toJSON()` returns a persistable shape whose `data` key holds every own property except the base fields — override the protected `getEventData()` when you want to control that payload explicitly. Because `DddAggregateRoot` extends the `AggregateRoot` of `@nestjs/cqrs`, publishing is that library's mechanism unchanged: `this.apply(event)` inside the aggregate, `EventPublisher.mergeObjectContext()` and `commit()` in the handler.

## Constraining state transitions

```typescript
import { DddAggregateRoot, DddEnum } from '@nestjslatam/ddd-lib';

export class OrderStatus extends DddEnum {
  static readonly DRAFT = new OrderStatus(1, 'DRAFT');
  static readonly CONFIRMED = new OrderStatus(2, 'CONFIRMED');
  static readonly CANCELLED = new OrderStatus(3, 'CANCELLED');

  private constructor(id: number, name: string) {
    super(id, name);
  }
}

interface TicketProps {
  status: OrderStatus;
}

export class Ticket extends DddAggregateRoot<Ticket, TicketProps, OrderStatus> {
  constructor(props: TicketProps) {
    super(props);
    this.defineValidTransitions(
      new Map([
        [OrderStatus.DRAFT, [OrderStatus.CONFIRMED, OrderStatus.CANCELLED]],
        [OrderStatus.CONFIRMED, [OrderStatus.CANCELLED]],
      ]),
    );
  }

  confirm(): void {
    if (!this.canTransitionTo(this.props.status, OrderStatus.CONFIRMED)) {
      throw new Error(`Cannot confirm from ${this.props.status.name}`);
    }
    this.props.status = OrderStatus.CONFIRMED;
    this.trackingState.markAsDirty();
  }
}
```

Declare the legal moves once with the protected `defineValidTransitions(map)`, then ask `canTransitionTo(from, to)` before each move. Both are protected, so the transition graph stays an implementation detail of the aggregate rather than something a caller can rewrite.

The third type parameter is constrained to `TState extends object`, which rules out string unions and TypeScript string enums. Model the state as a `DddEnum` subclass, as above — instances are objects, they carry an `id` and a `name`, and `DddEnum.getAll()` enumerates them.

## Known limitations

Verified against `2.1.2`. Each of these will bite someone.

- **`aggregate.version` is always `undefined`.** The field is declared and its setter is private with no caller, so nothing ever assigns it. Do not use it for optimistic concurrency; keep the version in your persistence layer.
- **An aggregate's broken rules are never cleared.** `DddAggregateRoot.validate()` appends to `brokenRules` without emptying it first, so a rule that failed on construction is still listed after you fix the value and re-validate. Call `aggregate.brokenRules.clear()` immediately before `validate()`. `DddValueObject.validate()` does clear, so value objects behave as expected.
- **`DddModule` and `DddService` do nothing.** The module provides a service whose only method, `explore()`, returns immediately. There is no bootstrap work to register; import the classes you need and skip the module.
- **No persistence.** `IDomainReadRepository` and `IDomainWriteRepository` are interfaces describing `find`, `findById`, `insert`, `insertBatch`, `update` and `delete`. No implementation ships — no ORM, no driver, no adapter. Write the repository yourself, or use [`@nestjslatam/ddd-es-lib`](https://www.npmjs.com/package/@nestjslatam/ddd-es-lib) for an event-sourced store.
- **`2.0.0` and `2.1.0` are deprecated on npm.** `2.0.0` crashes on import when `@nestjs/cqrs` is absent, because it imported the package without declaring the peer dependency. `2.1.0` breaks every CommonJS consumer by way of an ESM-only `uuid@14`, which fails under Jest and Node below 20.19 with `ERR_REQUIRE_ESM`. `2.1.1` fixed the dependency; `2.1.2` repaired `NumberValueObject`, which threw on every construction from the moment it shipped. If you are on any earlier `2.x`, upgrade.

## Documentation

- [Getting started](../../docs/getting-started.md) — prerequisites, install and run the sample application end to end.
- [Domain layer](../../docs/domain-layer.md) — how the sample models aggregates, entities and value objects with these classes.
- [Architecture overview](../../docs/architecture.md) — the layers, the CQRS wiring, and where domain events travel.
- [Application layer](../../docs/application-layer.md) — commands, handlers and queries around the aggregates.
- [Infrastructure layer](../../docs/infrastructure-layer.md) — repository implementations and mappers for the sample.
- [Sample application source](https://github.com/nestjslatam/ddd/tree/main/src) — a working Orders and Products domain built on this package.
- [Changelog](../../CHANGELOG.md) — what changed in each release, including the deprecated versions.

## Contributing

Issues and pull requests are welcome at [nestjslatam/ddd](https://github.com/nestjslatam/ddd/issues). Commits follow the conventional-commit format the repository's commitlint configuration enforces, and CI runs lint, type-check and the Jest suite on every pull request.

## License

MIT — see [LICENSE](LICENSE).
