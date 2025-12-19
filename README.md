# DDD Library for NestJS - Sample Application

Welcome to the DDD Library for NestJS sample application. This project demonstrates how to implement Domain-Driven Design (DDD) principles in a NestJS application using the `@nestjslatam/ddd-lib` library.

## ⚠️ Disclaimer

**This library is not ready to be used in production environments.**

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
src/
├── app.module.ts              # Root application module
├── main.ts                    # Application entry point
├── shared/                    # Shared module
│   ├── application/           # Base command handlers, context
│   ├── domain/               # Shared value objects (Id, Name, etc.)
│   └── exceptions/           # Custom exception classes
└── singers/                   # Singers domain module
    ├── application/          # Application layer
    │   ├── dto/              # Data Transfer Objects
    │   ├── sagas/            # Long-running processes
    │   └── use-cases/        # Commands and Queries
    ├── domain/               # Domain layer
    │   ├── events/           # Domain events
    │   ├── singer.ts         # Singer aggregate root
    │   └── song.ts           # Song entity
    └── infrastructure/       # Infrastructure layer
        ├── db/               # Database tables and repositories
        └── mappers/          # Domain ↔ Database mappers
```

For detailed information about each layer, see:

- [Domain Layer Documentation](docs/domain-layer.md)
- [Application Layer Documentation](docs/application-layer.md)
- [Infrastructure Layer Documentation](docs/infrastructure-layer.md)

## Key Features

### 🏗️ Domain-Driven Design

- **Aggregate Roots**: `Singer` aggregate manages its consistency boundary
- **Entities**: `Song` entity within the Singer aggregate
- **Value Objects**: `FullName`, `PicturePath`, `Id`, `Name`, etc.
- **Domain Events**: `SingerCreatedDomainEvent`, `SingerSubscribedDomainEvent`, etc.
- **Business Rules**: Enforced at the domain level with validation

### 🔄 CQRS Pattern

- **Commands**: Write operations (Create, Update, Delete)
- **Queries**: Read operations (GetById, GetByCriteria)
- **Command Handlers**: Process commands and modify domain state
- **Query Handlers**: Retrieve and return data

### 📡 Event-Driven Architecture

- **Domain Events**: Published when domain state changes
- **Event Handlers**: React to domain events
- **Sagas**: Long-running processes that coordinate multiple operations

### 🗄️ Repository Pattern

- **Read/Write Separation**: `IDomainReadRepository` and `IDomainWriteRepository`
- **TypeORM Integration**: Database persistence with TypeORM
- **Mappers**: Convert between domain models and database tables

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
