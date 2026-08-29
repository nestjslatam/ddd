# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## Unreleased

Sample application only. The published library is unaffected.

### Removed a placeholder rule that only became visible when the guard was fixed

`ProductPriceValidator` required the price to be **a multiple of 100** — no product could cost 19.99, or 150, or anything not divisible by 100. The rule had existed all along but was never enforced, because the guard it fed tested a Function object and was therefore always truthy. Fixing that guard turned the rule on for the first time.

It also **contradicted `PriceRangeValidator`**, which explicitly permits two decimal places. A price of 19.99 satisfied one validator and violated the other, which is not something a sample meant to teach aggregate design should demonstrate.

The rule is gone. `ProductPriceValidator` keeps the two rules that read as real invariants: greater than zero, and at most 1000000.

### The aggregate guard is still covered, and better

The test proving the aggregate-level guard runs had leaned on the removed rule. It now uses the price cap instead: `PriceRangeValidator` allows up to 9999999.99, so **2 000 000 is a perfectly valid `Price` that the aggregate must still reject**. That is a genuine split between value-object and aggregate responsibility rather than an artificial one, and it is exactly the case the dead guard used to let through.

304 tests pass.

## 4.0.0 (2026-08-29)

Eleven of the library's twelve core files had **no test suite at all** — roughly 4000 lines, including `DddAggregateRoot` and `DddValueObject` themselves. Writing those suites surfaced **34 confirmed defects**, eight of them severe. This release fixes them.

Coverage of the published library goes from **58.4% to 98.6%** lines, and the test count from 308 to **1017**.

### Why the reported coverage never showed this

Five independent mechanisms each hid it, and any one alone was enough:

| Mechanism                                                                                                                                                        | Effect                                            |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `collectCoverageFrom` excluded `aggregate-root.ts`, `valueobject.ts`, `domain-event.ts`, `enum.ts`, `tracking-state-manager.ts`, `helpers/**`, `valueobjects/**` | The untested files were not measured              |
| `coverageReporters` lacked `json-summary`                                                                                                                        | `coverage-summary.json` was never written         |
| CI wrapped its gate in `if [ -f coverage-summary.json ]`                                                                                                         | The gate skipped itself, silently, on every build |
| No `global` entry in `coverageThreshold`                                                                                                                         | Nothing enforced an overall floor                 |
| The 15 per-file thresholds                                                                                                                                       | All on files already at 100%                      |

All five are fixed. The floor is now 95% lines / 90% branches globally, CI **fails** rather than skipping when the report is missing, and the exclusions are gone.

### ⚠ BREAKING CHANGES

**`DddAggregateRoot.validate()` clears broken rules before re-deriving them.** Previously it only ever appended, so an aggregate that failed validation once could **never become valid again** — `isValid` reads that manager, so every downstream `if (!aggregate.isValid) throw` kept firing after the violation was corrected. The canonical load → correct → revalidate → save flow was impossible. `DddValueObject.validate()` has always cleared; this is the same contract on the aggregate side. Rules seeded into an injected `BrokenRulesManager` no longer survive construction — add them after constructing.

**`getCopy()` / `clone()` return an independent instance.** They were `Object.assign(Object.create(proto), this)`, which copied the property map, the broken rules, the validators and the tracking state **by reference** — mutating the "copy" mutated the original. In objects whose defining property is immutability. Note that property-changed subscriptions are not carried to the copy: subscribe to the copy.

**`IdValueObject` enforces its invariant on every path.** `setValue()` now throws `InvalidFormatException` instead of silently accepting arbitrary text — an identity could previously be overwritten with `'not-a-uuid'` and still report `isValid === true`. The protected constructor validates too. Values are canonicalized to lowercase, so upper- and lower-case spellings of the same UUID are now equal and share a hash; a store holding upper-case UUIDs will read back lower-case. `getHashCode()` returns a real per-value hash instead of the constant `38` for every id. The rejection message said "valid UUID v4" while the code accepted any RFC 4122 version — the message was wrong and now says "a valid UUID".

**Every `StringValueObject` option now takes effect.** `allowEmpty`, `trimWhitespace`, `minLength` and `maxLength` were all silently ignored: the constructor assigned `this.options` _after_ `super(value)`, by which point the base had already run `addValidators()` and `validate()`. Values that were accepted because their options did nothing may now report broken rules. `StringValueObject.empty()` is now valid; it previously carried "value cannot be empty". This is the same defect `NumberValueObject` shipped with, fixed the same way.

Behind it sat a second one: the `maxLength` branch pushed a bare object literal into `ValidatorRuleManager`, so `validator.validate()` threw `TypeError` the moment it was reached. Nobody hit it, because the first defect meant it never was.

**`DddEnum.getAll()` returns a new array on every call.** It returned the internal cache array itself, so a single in-place `sort()`, `pop()` or `splice()` by any caller permanently corrupted every lookup in the process. `getAll() === getAll()` was true and is now false; the members are still the same singletons. It also reflects members declared after the first lookup instead of freezing a partial list, and a subclass of a populated enumeration now inherits its parent's members instead of resolving nothing.

**`StateTransitionManager` uses one comparator argument order.** `canTransitionTo` invoked the comparator as `(definedState, queryState)` for the source lookup and `(queryState, definedState)` for the target match, so any asymmetric comparator — wildcards, subtype matching — gave contradictory answers inside a single call. It is `(definedState, queryState)` everywhere now, documented on the comparator type. `defineTransitions` throws on two source keys the comparator considers equal, rather than silently dropping the second. Symmetric comparators and the reference-equality default are unaffected.

**Nested change detection works for this library's own objects.** `NestedPropertyChangeDetector` looked for a child property named `Tracking`; `DddValueObject` and `DddAggregateRoot` both expose it as `trackingState`, so the documented feature had never fired for anything this library produces. Repositories branching on those flags will start seeing writes they previously skipped. With several tracked children the surviving flag is now deterministic — `new < dirty < selfDeleted < deleted` — instead of depending on `Object.keys` order.

### 🐛 Also fixed

- `version` on `DddAggregateRoot` was declared `number`, never assigned, and always `undefined` — while documented as being for optimistic concurrency control.
- `propsCopy` promised the `TProps` members in its return type and did not deliver them.
- `toPlainObject`/`toObject` spread props over the identity, so a props key named `id` or `version` silently won.
- `equals()` was not reflexive when a component was `NaN`.
- `EventMetadataBuilder.create` threw with a garbled message; `validateMetadata` accepted `undefined` and `NaN` versions.
- `toJSON`'s payload aliased the event's own arrays and objects.
- `extractMetadata` treated a present-but-falsy value as missing.
- `getUtcDate` read the clock three times and could return a date that never existed.
- `InvalidFormatException` dropped the offending value from its message when that value was the empty string.

### 📈 Migration

The compiler finds none of this — the changes are behavioural. In order of how likely you are to be affected:

1. **Remove any workaround for sticky broken rules.** If you called `aggregate.brokenRules.clear()` before `validate()`, delete it; `validate()` does it now.
2. **Check anything that reads `clone()` or `getCopy()`.** If you relied on the copy sharing state, that was the bug. Re-subscribe property-changed handlers on the copy.
3. **Lower-case your stored UUIDs, or accept that reads now return lower-case.** Equality across cases is a fix, but a store with mixed casing will look different.
4. **Re-check `StringValueObject` subclasses that pass options.** Values that used to pass may now fail, because the options finally apply.
5. **If you pass a custom state comparator, confirm the argument order.** It is `(definedState, queryState)`.
6. `npx ddd validate` reports the `isValid` shape mismatch from 3.0.0; nothing in 4.0.0 needs a codemod.

## 3.0.0 (2026-08-28)

Published as `@nestjslatam/ddd-lib@3.0.0`.

### ⚠ BREAKING CHANGE: `isValid` is a getter everywhere

`DddAggregateRoot.isValid()` was a **method**; `DddValueObject.isValid` was a **getter**. Both are getters now.

```diff
- if (!order.isValid()) { ... }
+ if (!order.isValid) { ... }
```

Value objects are unaffected — they already read as a property.

**Why this was worth breaking.** The two shapes made a silent defect easy to write and impossible to see. `if (!order.isValid)` tests a `Function`, which is always truthy, so the guard never fires. TypeScript did not flag it, and since validation only _collects_ broken rules and never throws, nothing else caught it either. **Three such guards shipped in this repository's own sample**, including `Product.create` and `Order.create`, which meant neither factory ever rejected an invalid aggregate.

**Why a getter and not a method.** The direction was chosen for its failure mode, and the two are not symmetric:

| Unify on            | Existing `order.isValid()`                                  | Existing `if (!vo.isValid)`                                                       |
| ------------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------- |
| **getter** (chosen) | `TS6234` at compile time, `TypeError` at runtime — **loud** | unaffected                                                                        |
| method              | unaffected                                                  | becomes a silently dead guard — **the same bug, inflicted on value object users** |

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
