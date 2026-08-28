# DDD Library for NestJS - Sample Application

Welcome to the DDD Library for NestJS sample application. This project demonstrates how to implement Domain-Driven Design (DDD) principles in a NestJS application using the `@nestjslatam/ddd-lib` library.

## ⚠️ Important Version Information

**Current release: `@nestjslatam/ddd-lib@2.1.2`.**

The 2.x line publishes the DDD library as an independent npm package, which eliminated the circular dependency issues of 1.x and lets consumers resolve it the ordinary way.

**Upgrade if you are on any earlier 2.x release.** `2.0.0` crashed on import wherever `@nestjs/cqrs` was not already installed, and `2.1.0` broke every CommonJS consumer — including Jest — by way of an ESM-only `uuid`. Both are deprecated on npm; `2.1.2` also repairs `NumberValueObject`, which threw on every construction from the day it shipped. See the [changelog](CHANGELOG.md).

**This library is still in active development and not recommended for production environments.**

## 📋 Table of Contents

- [⚠️ Important Version Information](#️-important-version-information)
- [The ecosystem](#the-ecosystem)
- [Overview](#overview)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
  - [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Key Features](#key-features)
  - [🏗️ Domain-Driven Design](#️-domain-driven-design)
  - [🔄 CQRS Pattern](#-cqrs-pattern)
  - [📡 State Tracking](#-state-tracking)
  - [🗄️ Repository Pattern](#️-repository-pattern)
- [Using the DDD Library](#using-the-ddd-library)
- [The CLI](#the-cli)
- [Documentation](#documentation)
- [Technologies Used](#technologies-used)
- [Available Scripts](#available-scripts)
- [Contributing](#contributing)
- [License](#license)
- [Related Links](#related-links)

## The ecosystem

This repository is the base of four published packages:

| Package | What it is |
|---|---|
| [`@nestjslatam/ddd-lib`](https://www.npmjs.com/package/@nestjslatam/ddd-lib) | The DDD building blocks — aggregates, value objects, validators, broken rules, state tracking. Built from `libs/ddd` in this repository. |
| [`@nestjslatam/ddd-cli`](https://www.npmjs.com/package/@nestjslatam/ddd-cli) | A CLI for working with the library: understand it, scaffold any stereotype, extend it, audit your code. Usable directly or from an AI agent over MCP. |
| [`@nestjslatam/ddd-valueobjects`](https://www.npmjs.com/package/@nestjslatam/ddd-valueobjects) | Ready-made value objects — email, phone number, money, date range, document id — built on `ddd-lib`. |
| [`@nestjslatam/ddd-es-lib`](https://www.npmjs.com/package/@nestjslatam/ddd-es-lib) | Event sourcing for `ddd-lib`: event store, snapshots, upcasting, sagas, materialised views. |

## Overview

This sample application showcases a complete DDD implementation with:

- **Domain Layer**: Rich domain models with business rules, value objects, and domain events
- **Application Layer**: CQRS pattern with commands, queries, and sagas
- **Infrastructure Layer**: Repository pattern, in-memory by default so the sample stays about the domain
- **Shared Module**: Reusable domain primitives and base classes

The application implements a **Singers** domain module that manages singers and their songs, demonstrating core DDD concepts including aggregate roots, entities, value objects, domain events, and business rules validation.

## Architecture

This application follows a **layered architecture** based on Domain-Driven Design principles:

```
┌─────────────────────────────────────┐
│      Presentation Layer             │
│    (Controllers, DTOs)              │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│      Application Layer               │
│  (Commands, Queries, Handlers)       │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│      Domain Layer                    │
│  (Aggregates, Entities, Events)      │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│      Infrastructure Layer            │
│  (Repositories, Mappers, DB)         │
└─────────────────────────────────────┘
```

For detailed architecture documentation, see [Architecture Overview](docs/architecture.md).

## Getting Started

### Prerequisites

- Node.js 20.11 or higher
- npm

### Installation

```bash
npm install
```

### Running the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The application will start on `http://localhost:3000` (or the port specified in `PORT` environment variable).

### API Documentation

Once the application is running, you can access:

- **Swagger UI**: `http://localhost:3000/api`

## Project Structure

```
ddd/
├── libs/ddd/                    # DDD Library source (published to NPM)
│   ├── src/                     # Library source code
│   │   ├── core/                # Core DDD building blocks
│   │   │   ├── aggregate/       # Aggregate utilities
│   │   │   ├── business-rules/  # Business rules and broken rules
│   │   │   ├── repositories/    # Repository interfaces
│   │   │   ├── tracking-state/  # State tracking (new, dirty, deleted)
│   │   │   └── validator-rules/ # Validation framework
│   │   ├── valueobjects/        # Base value object classes
│   │   │   ├── id.valueobject.ts           # ID value object
│   │   │   ├── string.valueobject.ts       # String base class
│   │   │   ├── number.valueobject.ts       # Number base class
│   │   │   └── validators/                 # Built-in validators
│   │   ├── aggregate-root.ts    # AggregateRoot base class
│   │   ├── valueobject.ts       # ValueObject base class
│   │   ├── domain-event.ts      # Domain event base class
│   │   └── index.ts             # Library exports
│   ├── dist/                    # Compiled JavaScript (published)
│   ├── package.json             # Library package configuration
│   └── tsconfig.lib.json        # Library TypeScript config
│
├── src/                         # Sample application
│   ├── app.module.ts            # Root application module
│   ├── main.ts                  # Application entry point
│   │
│   ├── shared/                  # Shared domain primitives
│   │   ├── valueobjects/        # Reusable value objects
│   │   │   ├── Name.ts          # Name value object with validation
│   │   │   ├── Description.ts   # Description value object
│   │   │   ├── Price.ts         # Price value object
│   │   │   └── validators/      # Custom validators
│   │   └── shared.module.ts
│   │
│   ├── products/                # Products bounded context
│   │   ├── products.module.ts
│   │   ├── application/         # Application layer
│   │   │   ├── commands/        # Command handlers
│   │   │   ├── queries/         # Query handlers
│   │   │   └── dto/             # Data Transfer Objects
│   │   ├── domain/              # Domain layer
│   │   │   └── product-aggregate/
│   │   │       ├── product.ts   # Product aggregate root
│   │   │       ├── product.status.ts
│   │   │       └── validators/  # Product business rules
│   │   └── infrastructure/      # Infrastructure layer
│   │       └── repositories/    # Repository implementations
│   │
│   └── orders/                  # Orders bounded context
│       ├── orders.module.ts
│       ├── domain/
│       │   ├── order-aggregate/
│       │   │   ├── order.ts     # Order aggregate root
│       │   │   └── validators/
│       │   ├── entities/
│       │   │   └── order-item.entity.ts
│       │   └── value-objects/
│       │       ├── customer-info.vo.ts
│       │       └── shipping-address.vo.ts
│       └── infrastructure/
│
├── docs/                        # Documentation
├── test/                        # E2E tests
├── package.json                 # App dependencies (@nestjslatam/ddd-lib: ^1.0.56)
└── tsconfig.json                # App TypeScript config
```

### Key Directory Explanations

**`libs/ddd/`** - The DDD library that is published to NPM as `@nestjslatam/ddd-lib`. This library provides:

- Base classes for aggregates, entities, and value objects
- Validation framework with `AbstractRuleValidator`
- State tracking (new, dirty, deleted)
- Business rules management
- Domain event support

**`src/shared/`** - Application-level shared code that uses the DDD library:

- Custom value objects (Name, Description, Price)
- Custom validators specific to the application
- Reusable domain primitives

**`src/products/` & `src/orders/`** - Bounded contexts that demonstrate:

- Aggregate roots extending `DddAggregateRoot`
- Custom business rule validators
- Value objects extending `StringValueObject`, `NumberValueObject`
- Domain events and state management

## Key Features

### 🏗️ Domain-Driven Design

The `@nestjslatam/ddd-lib` library provides powerful building blocks for implementing DDD:

- **Aggregate Roots**: `Product`, `Order` aggregates manage their consistency boundaries
  - Extend `DddAggregateRoot` from the library
  - Automatic state tracking (new, dirty, deleted)
  - Built-in validation orchestration
- **Value Objects**: `Name`, `Description`, `Price`, `CustomerInfo`, `ShippingAddress`

  - Extend `StringValueObject` or `NumberValueObject`
  - Immutable by design
  - Custom validation rules
  - Type-safe value access

- **Custom Validators**: Business rules enforced through `AbstractRuleValidator`

  - `ProductNameValidator`, `ProductPriceValidator`
  - `OrderTotalValidator`, `OrderItemQuantityValidator`
  - Automatic validation on aggregate changes

- **Domain Events**: Events published when domain state changes
  - `ProductCreatedEvent`, `OrderPlacedEvent`
  - Event-driven workflows

### 🔄 CQRS Pattern

- **Commands**: Write operations (Create, Update, Delete)
- **Queries**: Read operations (GetById, GetByCriteria)
- **Command Handlers**: Process commands and modify domain state
- **Query Handlers**: Retrieve and return data

### 📡 State Tracking

The library provides automatic state tracking for all aggregates:

- **isNew**: Newly created aggregates
- **isDirty**: Modified aggregates
- **isDeleted**: Soft-deleted aggregates
- **hasErrors**: Validation errors detected

### 🗄️ Repository Pattern

- **Read/Write Separation**: `IDomainReadRepository` and `IDomainWriteRepository`
- **In-Memory Implementation**: For development and testing
- **Easy Integration**: Works with any data persistence layer

## Using the DDD Library

### Installation

```bash
npm install @nestjslatam/ddd-lib
```

### Example: Creating a Value Object

```typescript
import { StringValueObject } from '@nestjslatam/ddd-lib';
import { NameLengthValidator } from './validators';

export class Name extends StringValueObject {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): Name {
    const name = new Name(value);
    if (!name.isValid) {
      const errors = name.brokenRules.getBrokenRules();
      throw new Error(
        `Invalid name: ${errors.map((e) => e.message).join(', ')}`,
      );
    }
    return name;
  }

  protected override addValidators(): void {
    super.addValidators();
    this.validatorRules.add(new NameLengthValidator(this));
  }
}
```

### Example: Creating a Custom Validator

```typescript
import { AbstractRuleValidator } from '@nestjslatam/ddd-lib';
import { Name } from '../Name';

export class NameLengthValidator extends AbstractRuleValidator<Name> {
  constructor(subject: Name) {
    super(subject);
  }

  public addRules(): void {
    const value = this.subject.getValue();

    if (!value || value.trim().length === 0) {
      this.addBrokenRule('value', 'Name cannot be empty');
    }

    if (value && value.length < 3) {
      this.addBrokenRule('value', 'Name must be at least 3 characters');
    }

    if (value && value.length > 100) {
      this.addBrokenRule('value', 'Name must not exceed 100 characters');
    }
  }
}
```

### Example: Creating an Aggregate Root

```typescript
import { DddAggregateRoot, IdValueObject } from '@nestjslatam/ddd-lib';
import { Name } from '../../shared/valueobjects/Name';
import { Price } from '../../shared/valueobjects/Price';
import { Description } from '../../shared/valueobjects/Description';
import { ProductStatus } from './product.status';
import {
  ProductNameValidator,
  ProductPriceValidator,
  ProductStatusValidator,
} from './validators';

interface ProductProps {
  name: Name;
  description: Description;
  price: Price;
  status: ProductStatus;
}

export class Product extends DddAggregateRoot<ProductProps> {
  private constructor(
    id: IdValueObject,
    props: ProductProps,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super(id, props, createdAt, updatedAt);
  }

  static create(name: Name, description: Description, price: Price): Product {
    const id = IdValueObject.create();
    const product = new Product(id, {
      name,
      description,
      price,
      status: ProductStatus.INACTIVE,
    });

    // Validate on creation
    product.validate();

    if (!product.isValid()) {
      throw new Error('Invalid product');
    }

    return product;
  }

  // Business methods
  ChangePrice(price: Price): void {
    if (!price.isValid) {
      throw new Error('Invalid price');
    }

    this.props.price = price;
    this.trackingState.markAsDirty();
    this.validate();
  }

  ChangeStatus(status: ProductStatus): void {
    if (status === ProductStatus.ACTIVE && this.props.price.getValue() === 0) {
      throw new Error('Cannot activate product with zero price');
    }

    this.props.status = status;
    this.trackingState.markAsDirty();
  }

  // Validation
  protected override addValidators(): void {
    super.addValidators();
    this.validatorRules.add(new ProductNameValidator(this));
    this.validatorRules.add(new ProductPriceValidator(this));
    this.validatorRules.add(new ProductStatusValidator(this));
  }

  // Getters
  get name(): Name {
    return this.props.name;
  }

  get price(): Price {
    return this.props.price;
  }

  get status(): ProductStatus {
    return this.props.status;
  }
}
```

## What's New in Version 2.0.0

### Major Changes from 1.x.x

**🎯 NPM Package Distribution**

- **Before (1.x.x)**: Library was part of the monorepo using TypeScript path mappings
- **After (2.0.0)**: Library is published as an independent NPM package `@nestjslatam/ddd-lib`
- **Benefit**: Standard Node.js module resolution, works in any NestJS project

**🔧 Eliminated Circular Dependencies**

- **Before (1.x.x)**: Circular dependency issues caused runtime errors like "Class extends value undefined"
- **After (2.0.0)**: Direct imports from specific files eliminate circular dependencies
- **Example**: `import { AbstractNotifyPropertyChanged } from './core/business-rules/impl/property-change'`

**📦 Pre-compiled Distribution**

- **Before (1.x.x)**: TypeScript source files with on-the-fly compilation
- **After (2.0.0)**: Pre-compiled JavaScript with TypeScript declarations
- **Benefit**: Faster application startup, reliable runtime behavior

**🎨 Cleaner Imports**

- **Before (1.x.x)**: Required path mappings in `tsconfig.json`
  ```json
  "paths": {
    "@nestjslatam/ddd-lib": ["libs/ddd/src"],
    "@nestjslatam/ddd-lib/*": ["libs/ddd/src/*"]
  }
  ```
- **After (2.0.0)**: Standard NPM imports
  ```typescript
  import { DddAggregateRoot, StringValueObject } from '@nestjslatam/ddd-lib';
  ```

**🚀 Improved Module Exports**

- All core classes properly exported through `index.ts`
- No need for deep imports into library internals
- Better tree-shaking support

**📚 Enhanced Type Definitions**

- Complete `.d.ts` files for all exported classes
- Better IDE autocomplete and type checking
- Source maps for debugging

### Migration from 1.x.x to 2.0.0

1. **Remove path mappings** from `tsconfig.json`:

   ```diff
   - "paths": {
   -   "@nestjslatam/ddd-lib": ["libs/ddd/src"]
   - }
   ```

2. **Install the NPM package**:

   ```bash
   npm install @nestjslatam/ddd-lib
   ```

3. **Update imports** to use the published package:

   ```typescript
   // All imports now come from the package
   import {
     DddAggregateRoot,
     StringValueObject,
     NumberValueObject,
     AbstractRuleValidator,
     IdValueObject,
   } from '@nestjslatam/ddd-lib';
   ```

4. **No webpack configuration needed** - Standard module resolution works out of the box

## The CLI

[`@nestjslatam/ddd-cli`](https://github.com/nestjslatam/ddd-cli) generates and audits the code this sample demonstrates by hand.

```bash
npm install -D @nestjslatam/ddd-cli
```

### Understand the library

```bash
npx ddd list                          # every stereotype, grouped, with its role
npx ddd list --family validation      # just the validators and business rules
npx ddd explain AbstractRuleValidator # what it is, its contract, an example
```

`list` uses no model at all. It reads the `.d.ts` files of the `ddd-lib` **installed in your project** with the TypeScript compiler, so it reflects your version rather than whatever the CLI was built against. The output turns on the distinction that is most of understanding the design: `extend` (a base you subclass), `implement` (an interface), `compose` (a collaborator the aggregate delegates to — `BrokenRulesManager`, `ValidatorRuleManager`, `TrackingStateManager`) and `use`.

### Create and extend

```bash
npx ddd new value-object OrderTotal --kind number
npx ddd new validator OrderTotalRules --for OrderTotal
npx ddd extend AbstractRuleValidator ShippingRules
npx ddd generate:aggregate "An order has a customer and a total. The total must be positive."
```

`new` and `extend` use no model: these have one correct shape, taken from the code in this repository. `extend` derives the contract from the installed declarations, so it works for bases it has never seen. Nothing is written before you see the file list and confirm.

### Audit what you wrote

```bash
npx ddd validate
```

Four rules, each a mistake this library makes easy and silent:

| Rule | Why it matters |
|---|---|
| `no-subclass-state-in-add-validators` | The base constructor calls `addValidators()` **before** the subclass constructor body runs. Reading a field assigned there throws on every construction — this is exactly how `NumberValueObject` shipped broken through two releases. |
| `super-add-validators` | `StringValueObject` and `NumberValueObject` register real validators there. An override that does not chain drops them, and invalid values pass with no error. |
| `factory-checks-validity` | Validation collects broken rules rather than throwing, so a `create()` that skips the `isValid` check can return an object that failed its own invariants. |
| `handler-commits-events` | An aggregate collects its domain events; only `mergeObjectContext(...).commit()` dispatches them. Without it the command succeeds and every downstream handler is silently skipped. |

### From an AI agent

If you already work inside Claude Code, Codex or Cursor, that agent has a model and credentials — the CLI does not need its own:

```bash
claude mcp add ddd -- npx -y @nestjslatam/ddd-cli mcp
```

Seven tools become available, with **no API key**. The agent supplies the domain modelling; the CLI reads the installed declarations exactly, renders deterministically and audits the idiom.

## Documentation

Comprehensive documentation is available in the `docs/` folder:

### Architecture & Development

- **[Architecture Overview](docs/architecture.md)** - Detailed explanation of the DDD architecture
- **[Domain Layer](docs/domain-layer.md)** - Domain entities, value objects, and business rules
- **[Application Layer](docs/application-layer.md)** - Commands, queries, handlers, and sagas
- **[Infrastructure Layer](docs/infrastructure-layer.md)** - Repositories, mappers, and database setup
- **[Getting Started Guide](docs/getting-started.md)** - Step-by-step setup and usage
- **[API Reference](docs/api-reference.md)** - Complete API endpoint documentation

### CI/CD & Automation

- **[CI/CD Summary](docs/ci-cd-summary.md)** - Executive summary of CI/CD automation
- **[CI/CD Implementation Guide](docs/ci-cd-implementation.md)** - How to use the CI/CD system
- **[CI/CD Plan](docs/ci-cd-plan.md)** - Detailed CI/CD implementation plan
- **[CI/CD Workflows Examples](docs/ci-cd-workflows-examples.md)** - GitHub Actions workflow examples

## Technologies Used

- **NestJS 11** - Progressive Node.js framework
- **TypeScript 5.9** - Typed superset of JavaScript
- **@nestjs/cqrs** - Commands, queries, events and sagas
- **@nestjslatam/ddd-lib** - The DDD building blocks
- **class-validator / class-transformer** - Request validation and transformation
- **Swagger** - API documentation
- **Jest 30** - Testing framework
- **ESLint 10 / Prettier** - Linting and formatting
- **Husky + Commitlint** - Git hooks and commit message linting

Persistence is deliberately absent. The repositories under `src/**/infrastructure` are in-memory, which keeps the sample about the domain rather than about a database — pick your own store and implement the repository contract against it.

## Available Scripts

```bash
# Development
npm run start:dev          # Start in watch mode
npm run start:debug        # Start in debug mode

# Building
npm run build              # Build the application
npm run build:lib          # Build the DDD library

# Testing
npm run test               # Run unit tests
npm run test:watch         # Run tests in watch mode
npm run test:cov           # Run tests with coverage
npm run test:e2e           # Run end-to-end tests

# Code Quality
npm run lint               # Run ESLint
npm run format             # Format code with Prettier
```

## Contributing

This is a sample application demonstrating DDD principles with NestJS. Contributions and feedback are welcome!

## License

MIT

## Related Links

- [NestJS Documentation](https://docs.nestjs.com/)
- [NestJS Latam](https://nestjslatam.dev/) - The community behind these packages
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [CQRS Pattern](https://martinfowler.com/bliki/CQRS.html)

### Sibling repositories

- [nestjslatam/ddd-cli](https://github.com/nestjslatam/ddd-cli) - The CLI
- [nestjslatam/ddd-valueobjects](https://github.com/nestjslatam/ddd-valueobjects) - Ready-made value objects
- [nestjslatam/ddd-event-sourcing](https://github.com/nestjslatam/ddd-event-sourcing) - Event sourcing
