# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## 3.0.0 (2026-08-28)

Published as `@nestjslatam/ddd-lib@3.0.0`.

### ⚠ BREAKING CHANGE: `isValid` is a getter everywhere

`DddAggregateRoot.isValid()` was a **method**; `DddValueObject.isValid` was a **getter**. Both are getters now.

```diff
- if (!order.isValid()) { ... }
+ if (!order.isValid) { ... }
```

Value objects are unaffected — they already read as a property.

**Why this was worth breaking.** The two shapes made a silent defect easy to write and impossible to see. `if (!order.isValid)` tests a `Function`, which is always truthy, so the guard never fires. TypeScript did not flag it, and since validation only *collects* broken rules and never throws, nothing else caught it either. **Three such guards shipped in this repository's own sample**, including `Product.create` and `Order.create`, which meant neither factory ever rejected an invalid aggregate.

**Why a getter and not a method.** The direction was chosen for its failure mode, and the two are not symmetric:

| Unify on | Existing `order.isValid()` | Existing `if (!vo.isValid)` |
|---|---|---|
| **getter** (chosen) | `TS6234` at compile time, `TypeError` at runtime — **loud** | unaffected |
| method | unaffected | becomes a silently dead guard — **the same bug, inflicted on value object users** |

A loud failure you fix in minutes beats a silent one you ship for two releases.

**Migrating.** TypeScript tells you where: `TS6234: This expression is not callable because it is a 'get' accessor. Did you mean to use it without '()'?` For a mechanical pass, `ddd validate` from [`@nestjslatam/ddd-cli`](https://www.npmjs.com/package/@nestjslatam/ddd-cli) reads the shape your installed library declares and reports every call site, whichever version you are on.

`AggregateValidationOrchestrator.isValid()` is a getter too, for the same reason: one name, one shape.

## 2.1.2 (2026-08-28)

Published as `@nestjslatam/ddd-lib@2.1.2`. **Upgrade from any earlier 2.x if you use numeric value objects — they were unusable.**

### Bug Fixes

- **valueobjects:** repair `NumberValueObject`, which threw on every construction since it shipped:

  ```
  TypeError: Cannot read properties of undefined (reading 'allowNaN')
  ```

  This affected the class's own documented example, `NumberValueObject.create(10)`, and any subclass — including the `Price` value object in this repository's sample application. `StringValueObject` was unaffected.

  `DddValueObject`'s constructor calls `this.addValidators()`; `NumberValueObject` assigned `this.options` only after `super()` returned, so `addValidators()` read `this.options.allowNaN` while options was still `undefined`.

  Three changes: `NumberValueObject` rebuilds its validators once options exist (guarding the read alone left `allowZero`, `requirePositive` and `allowInfinity` silently ignored); `DddValueObject.validate()` becomes `protected` so a subclass can revalidate after reconfiguring; and `NumberNotNullValidator` no longer reports `NaN` as non-finite, since `Number.isFinite(NaN)` is `false` and that contradicted `allowNaN`.

  The defect survived two releases because nothing exercised it — the suites live under `libs/ddd`, and the sample app's coverage config excludes the valueobjects folder. 14 regression tests close that gap.

## 2.1.1 (2026-08-28)

Published as `@nestjslatam/ddd-lib@2.1.1`. **Upgrade from 2.1.0 — that version is broken for CommonJS consumers.**

### 🐛 Bug Fixes

- **deps:** revert `uuid` to `^11.1.0`. 2.1.0 bumped it to `^14`, which is **ESM-only** — `uuid@14` publishes no `main` and its `exports` map offers no CommonJS entry, whereas `uuid@11` is a dual CJS/ESM package. Any consumer loading `@nestjslatam/ddd-lib` through a CommonJS runtime got:

  ```
  Error [ERR_REQUIRE_ESM]: require() of ES Module .../uuid/dist-node/index.js
    from .../@nestjslatam/ddd-lib/valueobjects/id.valueobject.js not supported
  ```

  That covers Jest's default runtime on any Node below 24.9, and plain Node below 20.19 — which is to say most NestJS projects. It was missed at release because Node 20.19+ and 24.x load ESM through `require()` transparently, so a plain `node -e "require(...)"` smoke test passed.

- **ci:** the release pipeline's smoke test now runs under `node --no-experimental-require-module`, which emulates a strict CommonJS consumer. It fails against 2.1.0 and passes against 2.1.1, so this class of regression cannot ship again.

## 2.1.0 (2026-08-28)

Published as `@nestjslatam/ddd-lib@2.1.0`. No public API change — every source change in `libs/ddd/src` was formatting or comments, verified by diffing with whitespace ignored.

### 🐛 Bug Fixes

- **package:** declare `@nestjs/cqrs` as a peer dependency ([3a39a5e](https://github.com/nestjslatam/ddd/commit/3a39a5ef)) — the library imported it without declaring it, so `require('@nestjslatam/ddd-lib')` crashed with `Cannot find module '@nestjs/cqrs'` for any consumer that had not installed cqrs independently. This affected every install of 2.0.0.
- **package:** remove the self-referential dependency on `@nestjslatam/ddd-lib@^1.0.52` ([3a39a5e](https://github.com/nestjslatam/ddd/commit/3a39a5ef))
- **security:** drop `@nestjs/devtools-integration` ([f39753c](https://github.com/nestjslatam/ddd/commit/f39753ca)) — its last NestJS 11-compatible release pulled in `@nyariv/sandboxjs` with 13 open critical advisories. `npm audit` goes from 61 vulnerabilities to 0.
- **lint:** correct invalid regex escapes in the order and name validators ([70668ac](https://github.com/nestjslatam/ddd/commit/70668aca))
- **ci:** pin `@commitlint` to 20.x — 21 requires Node >=22.12, against this project's engines and CI matrix ([228a0ba](https://github.com/nestjslatam/ddd/commit/228a0bab))

### ⬆️ Dependencies

- Align on NestJS 11.2.3 ([3a39a5e](https://github.com/nestjslatam/ddd/commit/3a39a5ef)). Peer range stays `^10.0.0 || ^11.0.0`.
- Remove twelve dependencies with zero import sites: `typeorm`, `@nestjs/typeorm`, `graphql`, `@apollo/server`, `@nestjs/apollo`, `@nestjs/graphql`, `@automapper/core`, `sqlite`, `sqlite3`, `pg`, plus `i` and `m` (accidental installs).
- `uuid` 11 → 14, TypeScript 5.2 → 5.9, Jest 29 → 30, supertest 6 → 7, ESLint 8 → 10 with flat config.

### 🧹 Chores

- Untrack `libs/ddd/node_modules` (15,379 files) and `libs/ddd/dist` (240 files), which had been committed because `.gitignore` anchored its patterns to the repository root ([e040090](https://github.com/nestjslatam/ddd/commit/e0400908)).
- Pin line endings to LF. `.editorconfig` declared CRLF against an all-LF tree while `lint` ran with `--fix`, so running it would have rewritten every file ([b51714f](https://github.com/nestjslatam/ddd/commit/b51714f4)).

## 2.0.0 (2026-01-29)

See [the v2.0.0 release](https://github.com/nestjslatam/ddd/releases/tag/v2.0.0).

## 1.0.52 (2025-12-19)

See [the v1.0.52 release](https://github.com/nestjslatam/ddd/releases/tag/v1.0.52).
