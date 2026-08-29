# Security policy

## Reporting a vulnerability

**Do not open a public issue.** Use GitHub's private reporting on this
repository — *Security → Report a vulnerability* — which reaches the
maintainers without disclosing anything.

Please include what you need to make the problem reproducible: the package and
version, a minimal case, and what an attacker gains. A report that cannot be
reproduced cannot be fixed.

You will get an acknowledgement within a few days. These are volunteer-
maintained libraries, so please allow reasonable time before disclosing
publicly.

## What is in scope

The published packages and the code that builds them:

| | |
|---|---|
| [`@nestjslatam/ddd-lib`](https://github.com/nestjslatam/ddd) | The library itself |
| [`@nestjslatam/ddd-cli`](https://github.com/nestjslatam/ddd-cli) | Including the MCP server, which an AI agent drives |
| [`@nestjslatam/ddd-valueobjects`](https://github.com/nestjslatam/ddd-valueobjects) | |
| [`@nestjslatam/ddd-es-lib`](https://github.com/nestjslatam/ddd-event-sourcing) | |

The release pipeline and the GitHub Actions workflows are in scope too: a way
to reach `NPM_TOKEN`, to publish from a fork, or to make a workflow run
attacker-controlled code is a vulnerability in these repositories even though
it is not in the shipped code.

## What is not in scope

**The sample applications under `src/` are teaching material, not products.**
Their repositories are in memory, they have no authentication, and they are not
meant to be deployed. A finding that amounts to "the sample has no auth" is
already documented rather than secret.

Anything requiring an attacker who already has write access to the repository,
or physical access to a maintainer's machine, is out of scope.

## Supported versions

Only the latest published version of each package receives fixes. The API is
still unstable and moves in breaking ways; pin an exact version and upgrade
deliberately.

Two versions of `@nestjslatam/ddd-lib` are **deprecated on npm and must not be
installed**: `2.0.0` crashed on import without `@nestjs/cqrs`, and `2.1.0` broke
every CommonJS consumer through an ESM-only `uuid`. A `^2.0.0` range still
resolves to them.

## How this project tries to earn the trust

Stated plainly, because a security policy that only makes promises is not worth
much:

- `main` is protected: no force pushes, no deletions, signed commits, and every
  change through a reviewed pull request.
- The `GITHUB_TOKEN` is read-only by default. The two workflows that need to
  write declare exactly what they need and nothing more.
- Secret scanning with push protection, Dependabot alerts, and CodeQL analysis
  run on every change.
- Releases are published from a tag, and the pipeline checks that the tag
  matches the manifest version before it publishes.
