# DDD Library for NestJS - Sample Application

Welcome to the DDD Library for NestJS sample application. This project demonstrates how to implement Domain-Driven Design (DDD) principles in a NestJS application using the `@nestjslatam/ddd-lib` library.

## ⚠️ Important Version Information

**Version 2.0.0** represents a major architectural change from version 1.x.x:

- The DDD library is now **published as an independent NPM package** (`@nestjslatam/ddd-lib`)
- **Eliminates circular dependency issues** that plagued version 1.x.x
- **Pre-compiled TypeScript modules** ensure reliable runtime behavior
- **Cleaner module resolution** using standard Node.js package resolution

**This library is still in active development and not recommended for production environments.**

## 📋 Table of Contents

- [DDD Library for NestJS - Sample Application](#ddd-library-for-nestjs---sample-application)
  - [⚠️ Disclaimer](#️-disclaimer)
  - [📋 Table of Contents](#-table-of-contents)
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
    - [📡 Event-Driven Architecture](#-event-driven-architecture)
    - [🗄️ Repository Pattern](#️-repository-pattern)
  - [Documentation](#documentation)
  - [Technologies Used](#technologies-used)
  - [Available Scripts](#available-scripts)
  - [Contributing](#contributing)
  - [License](#license)
  - [Related Links](#related-links)

## Overview

This sample application showcases a complete DDD implementation with:

- **Domain Layer**: Rich domain models with business rules, value objects, and domain events
- **Application Layer**: CQRS pattern with commands, queries, and sagas
- **Infrastructure Layer**: Repository pattern with TypeORM for data persistence
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

- Node.js (v18 or higher)
- npm or yarn
- SQLite (for development database)

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
- **GraphQL Playground**: Available if GraphQL is configured

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

- **NestJS** - Progressive Node.js framework
- **TypeScript** - Typed superset of JavaScript
- **TypeORM** - ORM for TypeScript and JavaScript
- **SQLite** - Lightweight database (development)
- **@nestjs/cqrs** - CQRS module for NestJS
- **@nestjslatam/ddd-lib** - DDD library for NestJS
- **Swagger** - API documentation
- **GraphQL** - Query language for APIs (optional)
- **Jest** - Testing framework
- **Husky** - Git hooks
- **Commitlint** - Commit message linting

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
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [CQRS Pattern](https://martinfowler.com/bliki/CQRS.html)
