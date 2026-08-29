<div align="center">

# `@nestjslatam/ddd-lib`

**Domain-Driven Design building blocks for NestJS.**
Aggregates that collect their own broken rules, value objects that validate themselves, and state tracking — on top of `@nestjs/cqrs`.

[![npm](https://img.shields.io/npm/v/%40nestjslatam%2Fddd-lib?color=1e73be&label=ddd-lib)](https://www.npmjs.com/package/@nestjslatam/ddd-lib)
[![CI](https://github.com/nestjslatam/ddd/actions/workflows/ci.yml/badge.svg)](https://github.com/nestjslatam/ddd/actions/workflows/ci.yml)
[![tests](https://img.shields.io/badge/tests-308%20passing-00d084)](#running-the-tests)
[![node](https://img.shields.io/badge/node-%3E%3D20.11-575760)](#requirements)
[![license](https://img.shields.io/badge/license-MIT-575760)](LICENSE)

[Quick start](#quick-start) · [FAQ](#faq) · [The four packages](#the-four-packages) · [Contributing](#contributing) · [The CLI](#the-cli)

</div>

---

```bash
npm install @nestjslatam/ddd-lib @nestjs/cqrs
```

`@nestjs/cqrs` is not optional — `DddAggregateRoot` extends its `AggregateRoot`. The full peer list is in [Requirements](#requirements).

## Quick start

```ts
import {
  DddAggregateRoot,
  NumberValueObject,
  AbstractRuleValidator,
  IdValueObject,
} from '@nestjslatam/ddd-lib';

// A rule lives in its own class, so it is testable on its own.
class PriceRule extends AbstractRuleValidator<Price> {
  addRules(): void {
    if (this.subject.getValue() <= 0) {
      this.addBrokenRule('value', 'Price must be greater than zero');
    }
  }
}

export class Price extends NumberValueObject {
  static create(value: number): Price {
    const price = new Price(value);
    if (!price.isValid) {
      throw new Error(price.brokenRules.getBrokenRules()[0].message);
    }
    return price;
  }

  override addValidators(): void {
    super.addValidators(); // the base registers real rules here — always chain
    this.validatorRules.add(new PriceRule(this));
  }
}

// An aggregate carries the invariants that span more than one value object.
export class Product extends DddAggregateRoot<Product, IProductProps> {
  private constructor(props: IProductProps, id?: IdValueObject) {
    super(props, { id });
    this.trackingState.markAsNew();
  }

  static create(name: Name, price: Price): Product {
    const product = new Product({ name, price });
    if (!product.isValid) {
      // Validation COLLECTS rules, it never throws. If you skip this check,
      // create() happily returns an object that failed its own invariants.
      throw new Error(
        product.brokenRules
          .getBrokenRules()
          .map((r) => r.message)
          .join(', '),
      );
    }
    return product;
  }

  protected override addValidators(): void {
    this.validators.add(new ProductRule(this));
  }
}
```

What that buys you, and where each failure is caught:

| Input                 | Result                                                | Caught by                                  |
| --------------------- | ----------------------------------------------------- | ------------------------------------------ |
| `Price.create(49.99)` | valid                                                 | —                                          |
| `Price.create(0)`     | `value must be a positive number (greater than zero)` | the **base** `NumberValueObject` validator |
| price `2_000_000`     | `Price must be less than 1000000`                     | the **aggregate**, `ProductRule`           |

Note the second row: `Price must be greater than zero` never fired. `super.addValidators()` had already registered the base's own positive-number rule, which caught `0` first. Drop that `super` call and _both_ rules disappear silently — no error, invalid value accepted.

This is not pasted from memory. The code above lives in [`libs/ddd/src/readme-example.spec.ts`](libs/ddd/src/readme-example.spec.ts), which asserts all three rows plus the getter shape, and **CI runs it on every push**. The examples it replaced had seven type errors and had never compiled against any published version — because nothing ever ran them.

> [!WARNING]
> **Not production-ready. Pin an exact version.** The public API is unstable and moves in breaking ways: `3.0.0` turned `isValid` from a method into a getter. Two releases are **deprecated on npm and must not be installed** — `2.0.0` crashed on import without `@nestjs/cqrs`, and `2.1.0` broke every CommonJS consumer through an ESM-only `uuid`. A `^2.0.0` range still resolves to them.

### Upgrading to 3.0.0

One change, and the compiler finds every site for you:

```diff
- if (!aggregate.isValid()) {
+ if (!aggregate.isValid) {
```

`isValid` was a **method** on aggregates and a **getter** on value objects — the same name with two shapes, which is how a guard like `if (!aggregate.isValid)` could read as a always-truthy `Function` and silently never fire. Both are getters now. TypeScript reports `TS6234`; for JavaScript consumers, `npx ddd validate` reports every call site by reading how _your installed version_ declares it.

## What you get

`DddAggregateRoot` extends `@nestjs/cqrs`'s `AggregateRoot` and pre-wires four collaborators you would otherwise hand-roll: `BrokenRulesManager` (error collection), `ValidatorRuleManager` (rule registration), `TrackingStateManager` (new / dirty / clean), and `StateTransitionManager` (a state machine). Plus `IdValueObject` identity, prototype-aware `equals`, and `toPlainObject`.

`npx ddd list` prints the full inventory by reading the declarations of the version you have installed, so it cannot go stale the way a table here would.

## The four packages

| Package                                                               | Install it when                                                           | Version |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------- |
| **[`ddd-lib`](https://www.npmjs.com/package/@nestjslatam/ddd-lib)**   | Always. This is the library. Built from `libs/ddd` here.                  | `3.0.0` |
| [`ddd-cli`](https://github.com/nestjslatam/ddd-cli)                   | As a **dev** dependency, to scaffold and audit. Not a runtime dependency. | `0.3.0` |
| [`ddd-valueobjects`](https://github.com/nestjslatam/ddd-valueobjects) | You want ready-made email / phone / money / document-id types.            | `1.1.0` |
| [`ddd-es-lib`](https://github.com/nestjslatam/ddd-event-sourcing)     | You are doing event sourcing on MongoDB. Hard-requires `mongoose`.        | `1.1.1` |

> [!CAUTION]
> **`ddd-valueobjects@1.1.0` does not compose with `ddd-lib@3.0.0` yet.** It declares `ddd-lib: ^2.0.0` as a regular dependency rather than a peer, so npm installs a **second, nested copy**:
>
> ```
> @nestjslatam/ddd-lib                                    3.0.0   isValid -> getter
> @nestjslatam/ddd-valueobjects/node_modules/ddd-lib      2.1.2   isValid -> method
> ```
>
> Two class identities, two different shapes, and `instanceof` fails across them. Use `ddd-valueobjects` with `ddd-lib` 2.x for now. Fixing this is [good first issue material](#contributing).

## The CLI

[`@nestjslatam/ddd-cli`](https://github.com/nestjslatam/ddd-cli) reads the `.d.ts` files of the `ddd-lib` **installed in your project** with the TypeScript compiler API — so it describes your version, not whatever it was built against.

```bash
npx ddd list                  # every stereotype, grouped by how you use it
npx ddd new value-object Sku  # scaffold; nothing is written until you confirm
npx ddd validate              # audit against the idiom
```

`validate` enforces four rules, each a mistake this library makes easy and silent:

| Rule                                  | The mistake it catches                                                                                                                                                                                               |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `no-subclass-state-in-add-validators` | The base constructor calls `addValidators()` **before** your constructor body runs. Reading a field you assign there throws on every construction — exactly how `NumberValueObject` shipped broken for two releases. |
| `super-add-validators`                | An override that does not chain drops the base's real validators, and invalid values pass with no error.                                                                                                             |
| `factory-checks-validity`             | A `create()` that skips the `isValid` check returns objects that failed their own invariants.                                                                                                                        |
| `handler-commits-events`              | Only `mergeObjectContext(...).commit()` dispatches domain events. Without it the command succeeds and every handler is silently skipped.                                                                             |

It also runs as an **MCP server**, so Claude Code, Codex or Cursor drive it with their own model and **no API key**:

```bash
claude mcp add ddd -- npx -y @nestjslatam/ddd-cli mcp
```

## The sample application

`src/` is an Orders and Products sample that consumes the library. It is not published.

```bash
npm install
npm run start:dev     # :3000, Swagger at /api
```

> [!WARNING]
> **Every write endpoint currently returns 500.** `main.ts` installs a global `ValidationPipe({ whitelist: true })`, and no DTO in `src/` carries a single `class-validator` decorator — so `whitelist` strips every property and the body arrives empty:
>
> ```
> POST /products  ->  500
> ArgumentNullException: value cannot be null or undefined
>     at new DddValueObject (node_modules/@nestjslatam/ddd-lib/valueobject.js:109:19)
> ```
>
> All **8** `@Body()` handlers are affected. Reads (`GET /products`, `GET /orders`) work. This is a defect in the sample, not the library — the 304 tests exercise the domain directly and all pass. It is [the best first contribution here](#contributing).

Repositories are in-memory by design: the sample stays about the domain rather than about a database. Implement the repository contract against your own store.

## FAQ

<details>
<summary><b>Four packages — which do I actually install?</b></summary>

`@nestjslatam/ddd-lib`, and only that, unless you specifically need one of the others. `ddd-cli` is a dev dependency. See [the table above](#the-four-packages), including the caution about `ddd-valueobjects`.
</details>

<details>
<summary><b>Does it work with my NestJS and Node version?</b></summary>

Declared: NestJS 10 or 11, Node `>=20.11`. In practice **only NestJS 11.2.3 is ever exercised** — CI varies Node (18, 20, 22) and never varies NestJS, so treat NestJS 10 as untested rather than supported.
</details>

<details>
<summary><b>What does <code>DddAggregateRoot</code> give me over writing my own base class?</b></summary>

The four managers listed in [What you get](#what-you-get), pre-wired to `@nestjs/cqrs`. Be aware the `StateTransitionManager` is the least proven piece — the sample in this repo does not use it, hand-rolling its own `canTransitionTo` instead.
</details>

<details>
<summary><b>Is it production-ready? Which version do I pin?</b></summary>

No. Pin `3.0.0` exactly. Four releases shipped in a single day and two of them are deprecated on npm for crashing on import — the API churns, and a caret range will find the broken versions.
</details>

<details>
<summary><b>What is the footgun that will bite me first?</b></summary>

Validation **collects** broken rules and never throws. Nothing stops an invalid aggregate from escaping unless your factory checks `isValid` itself. Second: the base constructor calls `addValidators()` before your subclass constructor body runs, so a validator reading a field you assign there throws on every construction.
</details>

<details>
<summary><b>I edited <code>libs/ddd</code> and the running app did not change. Why?</b></summary>

Only the tests read `libs/ddd/src` — Jest's `moduleNameMapper` points there. `tsconfig.json` has no path mapping, so `nest build` and `start:dev` resolve the package from `node_modules`. Run `npm run build:lib` and install the tarball, or add a path mapping, if you want the app to exercise your changes. **This split can hide bugs**: green tests against local source while the running app uses a different version entirely.
</details>

<details>
<summary><b>Is this repo the library or a sample app?</b></summary>

Both, and the library is the point. `libs/ddd/` is the published package; `src/` is the sample that consumes it. Anything you read describing a `Singers` module is stale — the sample is Orders and Products.
</details>

## Requirements

Node `>=20.11`. Five peer dependencies, all required:

```
@nestjs/common    ^10.0.0 || ^11.0.0
@nestjs/core      ^10.0.0 || ^11.0.0
@nestjs/cqrs      ^10.0.0 || ^11.0.0
rxjs              ^7.2.0
reflect-metadata  ^0.1.13 || ^0.2.0
```

Missing `@nestjs/cqrs` is what made `2.0.0` crash on import for everyone who had not installed it independently.

## Running the tests

```bash
npm install
npm test          # 23 suites, 308 tests, ~7s
npm run type-check
npm run lint
```

## Contributing

Contributions are wanted, and there is concrete, verifiable work waiting. Every item below was confirmed by running it.

**Good first issues**, in rough order of value:

1. **Fix the write endpoints.** Add `class-validator` decorators to the 8 input DTOs in `src/**/use-cases/*/`. Both packages are already installed. Verify with `POST /products` returning `201` instead of `500`.
2. **Fix `ddd-valueobjects` composition.** Move `@nestjslatam/ddd-lib` from `dependencies` to `peerDependencies` with `^2.0.0 || ^3.0.0`, in [that repo](https://github.com/nestjslatam/ddd-valueobjects).
3. **Make the e2e test assert something.** It currently requests `GET /singers` — an endpoint that does not exist — and accepts `200`, `404` _or_ `500`.
4. **Repair the coverage gate.** CI's 80% threshold never runs: the configured reporters emit `coverage-final.json` while the gate reads `coverage-summary.json`. Real line coverage is 74.8%.
5. **Rewrite the six stale `docs/`.** They describe a `Singers` module this repository does not contain.

**Before you open a PR**, CI will run: ESLint, `prettier --check`, `tsc --noEmit` against **both** `tsconfig.json` and `libs/ddd/tsconfig.lib.json`, unit tests with coverage on Node 18 / 20 / 22, e2e tests, the library build, and `npm audit --audit-level=moderate`. All pass locally today, so the bar is reachable:

```bash
npm run lint && npm run type-check && npm test
```

Commits follow [Conventional Commits](https://www.conventionalcommits.org/). Note that the husky hook is currently inert on a fresh clone — `package.json` has no `prepare` script — so nothing enforces this locally yet. Fixing that is itself a welcome PR.

## Documentation

| Document                                                                                       | Covers                                                                         |
| ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| [`libs/ddd/README.md`](libs/ddd/README.md)                                                     | The published package, current at 3.0.0 — this is what npm shows               |
| [`src/orders/README.md`](src/orders/README.md)                                                 | The Orders module in detail, accurate against the real controller (in Spanish) |
| [`docs/order-aggregate-implementation.md`](docs/order-aggregate-implementation.md)             | Aggregate design walkthrough                                                   |
| [`docs/VALIDATORS_AND_STATES_IMPLEMENTATION.md`](docs/VALIDATORS_AND_STATES_IMPLEMENTATION.md) | Validators and state tracking                                                  |
| [`CHANGELOG.md`](CHANGELOG.md)                                                                 | Every release, including the two deprecated ones and why                       |

> [!NOTE]
> Six further documents in `docs/` — `architecture.md`, `domain-layer.md`, `application-layer.md`, `infrastructure-layer.md`, `getting-started.md` and `api-reference.md` — are written around a `Singers` module that does not exist in this repository. They are still useful for the _shape_ of a DDD application, but do not expect to find the code they describe.

> [!TIP]
> **[The CLI's full guide →](https://github.com/nestjslatam/ddd-cli/blob/main/docs/GUIDE.md)** — every command and flag, walked through by building a complete domain from nothing into ten type-checking files. Worth reading even if you never install the CLI: it is the clearest write-up of this library's idiom anywhere, because every claim in it was produced by running the tool.

## Who is behind this

Built and maintained by **[BeyondNet Tech](https://beyondnet.info/)** with the [NestJS Latam](https://nestjslatam.dev/) community.

- **[Evolith](https://github.com/beyondnetcode/evolith_arch32)** — executable architecture governance: a CLI, MCP server and REST API that check a repository against Rego/OPA rules, and report a rule they could not evaluate as a failure rather than a silent pass. The same idea as `ddd validate`, one level up.
- **[Shell.ddd](https://github.com/beyondnetcode/Shell.ddd)** — the .NET counterpart of this library: entities, aggregate roots, value objects, domain events and business rules for C#.

## License

MIT — see [LICENSE](LICENSE).

---

<div align="center">

**Powered by [BeyondNetCode](https://beyondnet.info/)**

[Website](https://beyondnet.info/) · [GitHub](https://github.com/beyondnetcode) · [NestJS Latam](https://nestjslatam.dev/)

</div>
