# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
