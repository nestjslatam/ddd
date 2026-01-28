# @nestjslatam/ddd-lib

A comprehensive Domain-Driven Design (DDD) library for NestJS applications, providing building blocks and patterns to implement clean, maintainable, and scalable enterprise applications.

[![npm version](https://badge.fury.io/js/%40nestjslatam%2Fddd-lib.svg)](https://www.npmjs.com/package/@nestjslatam/ddd-lib)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ⚠️ Development Status

**Version 2.0.0** - This library is actively developed and NOT recommended for production use. Breaking changes may occur between minor versions.

## 🎯 What is Domain-Driven Design?

Domain-Driven Design has proven to be a game-changer in building scalable and maintainable applications by placing the domain at the heart of the software design process. This library simplifies the application of DDD concepts within the NestJS framework, empowering developers to create well-architected, domain-centric solutions.

## ✨ Key Features

### 🏗️ Core DDD Building Blocks

- **Aggregate Roots**: Base class `DddAggregateRoot` with built-in validation and state tracking
- **Value Objects**: `StringValueObject`, `NumberValueObject` with immutability
- **Entities**: Rich domain entities with identity
- **Domain Events**: Event-driven architecture support
- **Repositories**: Read/Write repository pattern interfaces

### 🔍 Advanced Features

- **Automatic State Tracking**: Track entity state (new, modified, deleted)
- **Validation Framework**: `AbstractRuleValidator` for custom business rules
- **Business Rules Management**: Broken rules collection and validation orchestration
- **Property Change Tracking**: Detect and react to property changes
- **Type Safety**: Full TypeScript support with complete type definitions

### 🚀 Framework Integration

- **NestJS Native**: Built specifically for NestJS framework
- **TypeScript First**: Leverages TypeScript's type system
- **Node.js Compatible**: Works seamlessly with Node.js ecosystem
- **Modular Architecture**: Import only what you need

## 📦 Installation

```bash
npm install @nestjslatam/ddd-lib
```

### Peer Dependencies

```bash
npm install @nestjs/common @nestjs/core rxjs uuid
```

## 🚀 Quick Start

### 1. Create a Value Object

```typescript
import { StringValueObject, AbstractRuleValidator } from '@nestjslatam/ddd-lib';

// Custom validator
class EmailValidator extends AbstractRuleValidator<Email> {
  constructor(subject: Email) {
    super(subject);
  }

  public addRules(): void {
    const value = this.subject.getValue();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(value)) {
      this.addBrokenRule('value', 'Invalid email format');
    }
  }
}

// Value Object
export class Email extends StringValueObject {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): Email {
    const email = new Email(value);

    if (!email.isValid) {
      const errors = email.brokenRules.getBrokenRules();
      throw new Error(
        `Invalid email: ${errors.map((e) => e.message).join(', ')}`,
      );
    }

    return email;
  }

  protected override addValidators(): void {
    super.addValidators();
    this.validatorRules.add(new EmailValidator(this));
  }
}
```

### 2. Create an Aggregate Root

```typescript
import { DddAggregateRoot, IdValueObject } from '@nestjslatam/ddd-lib';
import { Email } from './value-objects/email';

interface UserProps {
  email: Email;
  name: string;
  isActive: boolean;
}

export class User extends DddAggregateRoot<UserProps> {
  private constructor(
    id: IdValueObject,
    props: UserProps,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super(id, props, createdAt, updatedAt);
  }

  static create(email: Email, name: string): User {
    const id = IdValueObject.create();
    const user = new User(id, {
      email,
      name,
      isActive: false,
    });

    user.validate();
    return user;
  }

  // Business methods
  activate(): void {
    if (this.props.isActive) {
      throw new Error('User is already active');
    }

    this.props.isActive = true;
    this.trackingState.markAsDirty();
  }

  deactivate(): void {
    if (!this.props.isActive) {
      throw new Error('User is already inactive');
    }

    this.props.isActive = false;
    this.trackingState.markAsDirty();
  }

  // Getters
  get email(): Email {
    return this.props.email;
  }

  get name(): string {
    return this.props.name;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }
}
```

### 3. Use in Your Service

```typescript
import { Injectable } from '@nestjs/common';
import { User } from './domain/user';
import { Email } from './domain/value-objects/email';

@Injectable()
export class UserService {
  async createUser(emailStr: string, name: string): Promise<User> {
    const email = Email.create(emailStr);
    const user = User.create(email, name);

    // Check state
    console.log(user.trackingState.isNew); // true
    console.log(user.trackingState.isDirty); // false
    console.log(user.isValid()); // true

    // Business logic
    user.activate();
    console.log(user.trackingState.isDirty); // true

    return user;
  }
}
```

## 📚 Core Concepts

### Aggregate Roots

Aggregate roots are the entry points to your domain model. They enforce consistency boundaries and business rules.

```typescript
import { DddAggregateRoot } from '@nestjslatam/ddd-lib';

export class Order extends DddAggregateRoot<OrderProps> {
  // Your domain logic
}
```

**Features:**

- ✅ Automatic state tracking (new, dirty, deleted)
- ✅ Built-in validation orchestration
- ✅ Domain event support
- ✅ Broken rules management

### Value Objects

Value objects are immutable and represent domain concepts without identity.

```typescript
import { StringValueObject, NumberValueObject } from '@nestjslatam/ddd-lib';

export class Money extends NumberValueObject {
  // Your value object logic
}
```

**Built-in Validators:**

- `StringNotNullOrEmptyValidator` - Ensures string is not null or empty
- `NumberNotNullValidator` - Ensures number is not null
- `NumberPositiveValidator` - Ensures number is positive

### Custom Validators

Create business rule validators by extending `AbstractRuleValidator`.

```typescript
import { AbstractRuleValidator } from '@nestjslatam/ddd-lib';

export class PriceRangeValidator extends AbstractRuleValidator<Price> {
  public addRules(): void {
    const value = this.subject.getValue();

    if (value < 0) {
      this.addBrokenRule('value', 'Price cannot be negative');
    }

    if (value > 999999.99) {
      this.addBrokenRule('value', 'Price exceeds maximum');
    }
  }
}
```

### State Tracking

Every aggregate automatically tracks its state:

```typescript
const product = Product.create(name, price);

product.trackingState.isNew; // true
product.trackingState.isDirty; // false
product.trackingState.isDeleted; // false

product.changePrice(newPrice);
product.trackingState.isDirty; // true

product.trackingState.markAsDeleted();
product.trackingState.isDeleted; // true
```

## 🏗️ Architecture Example

```
src/
├── domain/
│   ├── aggregates/
│   │   └── product.ts          # Extends DddAggregateRoot
│   ├── value-objects/
│   │   ├── price.ts            # Extends NumberValueObject
│   │   └── product-name.ts     # Extends StringValueObject
│   └── validators/
│       └── price-range.validator.ts  # Extends AbstractRuleValidator
├── application/
│   ├── commands/
│   └── queries/
└── infrastructure/
    └── repositories/
```

## 🔄 Version 2.0.0 Changes

### What's New

**NPM Package Distribution**

- Library is now published as a standalone NPM package
- No need for monorepo or path mappings
- Standard Node.js module resolution

**Eliminated Circular Dependencies**

- Refactored internal imports to eliminate circular references
- Direct imports from specific modules
- Reliable runtime behavior

**Pre-compiled Distribution**

- Published as compiled JavaScript with TypeScript declarations
- Faster application startup
- Better tree-shaking support

**Improved Type Definitions**

- Complete `.d.ts` files for all exports
- Better IDE support and autocomplete
- Source maps for debugging

### Breaking Changes from 1.x.x

1. **Installation Method**

   ```bash
   # Before (1.x.x) - Local library
   # Used path mappings in tsconfig.json

   # After (2.0.0) - NPM package
   npm install @nestjslatam/ddd-lib
   ```

2. **Import Paths**

   ```typescript
   // Before (1.x.x)
   import { DddAggregateRoot } from '@nestjslatam/ddd-lib/aggregate-root';

   // After (2.0.0)
   import { DddAggregateRoot } from '@nestjslatam/ddd-lib';
   ```

3. **No Path Mappings Required**
   ```json
   // tsconfig.json - NO LONGER NEEDED
   {
     "paths": {
       "@nestjslatam/ddd-lib": ["libs/ddd/src"]
     }
   }
   ```

## 📖 API Reference

### Exported Classes

**Base Classes:**

- `DddAggregateRoot<T>` - Base class for aggregate roots
- `StringValueObject` - Base class for string value objects
- `NumberValueObject` - Base class for number value objects
- `IdValueObject` - UUID-based identity value object

**Validators:**

- `AbstractRuleValidator<T>` - Base class for custom validators
- `StringNotNullOrEmptyValidator` - Built-in string validator
- `NumberNotNullValidator` - Built-in number validator
- `NumberPositiveValidator` - Built-in positive number validator

**Managers:**

- `BrokenRulesManager` - Manages validation errors
- `ValidatorRuleManager` - Manages validator rules
- `TrackingStateManager` - Manages entity state

**Interfaces:**

- `IDomainReadRepository<T>` - Read repository interface
- `IDomainWriteRepository<T>` - Write repository interface

## 🤝 Contributing

We welcome contributions! This is an open-source project maintained by the NestJS LATAM community.

## 📄 License

This library is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [NPM Package](https://www.npmjs.com/package/@nestjslatam/ddd-lib)
- [GitHub Repository](https://github.com/nestjslatam/ddd)
- [Sample Application](https://github.com/nestjslatam/ddd/tree/main/src)
- [NestJS LATAM](http://nestjslatam.org/)

## 👥 Author

**Alberto Arroyo Raygada**

- Email: beyondnet.peru@gmail.com
- Website: [http://nestjslatam.org/](http://nestjslatam.org/)

## 🙏 Acknowledgments

This library is inspired by Domain-Driven Design principles and built specifically for the NestJS ecosystem. Special thanks to the NestJS and DDD communities for their invaluable insights and contributions.
