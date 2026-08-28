# @nestjslatam/ddd-lib

Domain-Driven Design building blocks for NestJS: aggregate roots that validate themselves, value objects that reject invalid input, and the broken-rules and state-tracking machinery behind both.

[![npm](https://img.shields.io/npm/v/%40nestjslatam%2Fddd-lib.svg)](https://www.npmjs.com/package/@nestjslatam/ddd-lib)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/nestjslatam/ddd/blob/main/LICENSE)

```bash
npm install @nestjslatam/ddd-lib
```

> [!WARNING]
> **Pre-1.0 in spirit.** The public API is not stable and this is not recommended for production. Pin an exact version.
>
> **`2.0.0` and `2.1.0` are deprecated on npm and should not be used.** `2.0.0` crashes on import wherever `@nestjs/cqrs` is not already installed; `2.1.0` breaks every CommonJS consumer, Jest included, through an ESM-only `uuid`. Current is **`2.1.2`**.

## A value object

```ts
import { NumberValueObject, NumberPositiveValidator } from '@nestjslatam/ddd-lib';

export class Price extends NumberValueObject {
  static create(value: number): Price {
    const price = new Price(value);

    // Validation collects broken rules; it never throws. A factory that does
    // not check is a factory that returns invalid objects.
    if (!price.isValid) {
      throw new Error(price.brokenRules.getBrokenRulesAsString());
    }

    return price;
  }

  override addValidators(): void {
    super.addValidators();
    this.validatorRules.add(new NumberPositiveValidator(this));
  }
}

Price.create(-1);
// Error: Property: value, Message: value must be a positive number (greater than zero)
```

## An aggregate root

```ts
import {
  AbstractRuleValidator,
  DddAggregateRoot,
  IdValueObject,
} from '@nestjslatam/ddd-lib';

interface IOrderProps {
  total: Price;
}

class OrderApprovalValidator extends AbstractRuleValidator<Order> {
  addRules(): void {
    if (this.subject.props.total.getValue() > 10_000) {
      this.addBrokenRule('total', 'Orders over 10,000 need manual approval');
    }
  }
}

export class Order extends DddAggregateRoot<Order, IOrderProps> {
  private constructor(props: IOrderProps, id?: IdValueObject) {
    super(props, { id });
    this.trackingState.markAsNew();
  }

  static create(total: Price): Order {
    const order = new Order({ total });

    // Note the parentheses. See "Two shapes of isValid" below.
    if (!order.isValid()) {
      throw new Error(order.brokenRules.getBrokenRulesAsString());
    }

    return order;
  }

  addValidators(): void {
    this.validators.add(new OrderApprovalValidator(this));
  }
}
```

## Two shapes of `isValid`

The single sharpest edge in this library, and worth reading before anything else.

| Base | Declaration | Correct use |
|---|---|---|
| `DddValueObject` | `get isValid(): boolean` | `if (!price.isValid)` |
| `DddAggregateRoot` | `isValid(): boolean` | `if (!order.isValid())` |

Reading the aggregate's method as a property tests a `Function`, which is always truthy — so `if (!order.isValid)` **never fires** and the guard beneath it is unreachable. TypeScript does not flag it, and since validation only collects broken rules and never throws, nothing else will either. This repository's own sample shipped three of them.

[`@nestjslatam/ddd-cli`](https://www.npmjs.com/package/@nestjslatam/ddd-cli) detects it:

```bash
npx ddd validate
# error  Order.create() reads isValid as a property, but it is a method on DddAggregateRoot
```

## What you get

**Aggregates.** `DddAggregateRoot<TEntity, TProps, TState extends object = object>` — self-validating, with equality, identity, serialization and a state machine. Its constructor takes `(props, options?)`, where the options carry an `id`, replacement managers, and `skipInitialValidation`. Override `addValidators(manager)` to register rules, `guard()` for construction-time checks, and `defineValidTransitions(map)` plus `canTransitionTo(from, to)` for a lifecycle.

**Value objects.** `DddValueObject` and three specializations you subclass: `StringValueObject`, `NumberValueObject`, `IdValueObject`. All have protected constructors — reach them through static factories.

**Validation.** `AbstractRuleValidator<TSubject>` for a single rule set, implementing `addRules()` and calling `addBrokenRule(property, message)`. `AbstractValidator` with `EntityValidator` and `ValueObjectValidator` for the entity-wide pass. `ValidatorRuleManager` holds them; `BrokenRulesManager` collects the results and answers `getBrokenRules()`, `getBrokenRulesAsString()`, `hasErrors()` and `clear()`.

**Events.** `DomainEvent`, also exported as `AbstractDomainEvent` — they are the same class. `EventMetadataBuilder.create(id, type, version).withCorrelationId(...).build()` builds the metadata. Events serialize to `eventId`, `eventType`, `eventVersion`, `occurredOn`, `metadata` and `data`.

**State tracking.** `TrackingStateManager` exposes `isNew`, `isDirty`, `isDeleted` and `isSelfDeleted`, with a `markAs*` method for each plus `markAsClean`. `StateTransitionManager` and `TrackingStateTransition` handle lifecycle transitions.

**Exceptions.** `DomainException` and five specializations: `ArgumentNullException`, `InvalidFormatException`, `InvalidOperationException`, `InvalidStateTransitionException`, `NoTransitionsDefinedException`.

Forty-four symbols in all. `npx ddd list` prints the full inventory grouped by family, read from the copy installed in your project.

## Requirements

- **Node 20.11 or later.**
- **Peer dependencies:** `@nestjs/common`, `@nestjs/core` and `@nestjs/cqrs` (`^10` or `^11`), plus `reflect-metadata` and `rxjs`. All are declared; npm 7 and later install missing ones for you.
- **One bundled dependency:** `uuid@^11`, used by `IdValueObject` and by `DomainEvent` to generate every `eventId`. It is not optional if you use either.

## Known limitations

Honest list, all verified against `2.1.2`:

- **`aggregate.version` is `undefined`.** The private setter has no caller.
- **An aggregate does not clear stale broken rules on re-validation.** Fix the data, call `validate()` again, and the old rule is still there — you must `brokenRules.clear()` first. Value objects do clear; aggregates do not.
- **`DddService.explore()` is empty**, and so is `DddModule.onApplicationBootstrap()`.
- **The repository interfaces ship no implementation.** `find`, `findById`, `insert`, `insertBatch`, `update` and `delete` are contracts for you to satisfy.
- **`propsCopy` is frozen one level deep.** The wrapper is frozen; the nested `props` object is not.

## The ecosystem

| Package | What it is |
|---|---|
| **`@nestjslatam/ddd-lib`** | These building blocks — you are here |
| [`@nestjslatam/ddd-cli`](https://www.npmjs.com/package/@nestjslatam/ddd-cli) | Inventory the stereotypes, scaffold them, subclass them, audit your code against this library's idiom. Runs as an MCP server so an AI agent can drive it |
| [`@nestjslatam/ddd-valueobjects`](https://www.npmjs.com/package/@nestjslatam/ddd-valueobjects) | Ready-made value objects: email, phone number, money, date range, document id |
| [`@nestjslatam/ddd-es-lib`](https://www.npmjs.com/package/@nestjslatam/ddd-es-lib) | Event sourcing: event store, snapshots, upcasting, sagas, materialised views |

## Documentation

The [repository](https://github.com/nestjslatam/ddd) carries a working sample — Orders and Products — under `src/`, and it is the best reference for how these pieces fit together. [`order-aggregate-implementation.md`](https://github.com/nestjslatam/ddd/blob/main/docs/order-aggregate-implementation.md) walks through it.

> [!NOTE]
> Six older documents in `docs/` describe a `singers` module that no longer exists, and one of them documents a TypeORM setup removed in 2.1.0. They are useful for the general shape of a DDD application, not as a guide to the code that ships. The repository README says which is which.

## Links

- [Repository](https://github.com/nestjslatam/ddd) · [Changelog](https://github.com/nestjslatam/ddd/blob/main/CHANGELOG.md) · [Issues](https://github.com/nestjslatam/ddd/issues)
- [NestJS Latam](https://nestjslatam.dev/) — the community behind these packages

## License

MIT. Author: Alberto Arroyo Raygada.
