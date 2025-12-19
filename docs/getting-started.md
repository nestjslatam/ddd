# Getting Started Guide

This guide will help you set up and run the DDD Library for NestJS sample application.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Testing the API](#testing-the-api)
- [Project Structure](#project-structure)
- [Next Steps](#next-steps)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18 or higher
  - Download from [nodejs.org](https://nodejs.org/)
  - Verify installation: `node --version`

- **npm**: Usually comes with Node.js
  - Verify installation: `npm --version`

- **Git**: For cloning the repository (if applicable)
  - Download from [git-scm.com](https://git-scm.com/)

## Installation

### 1. Clone or Navigate to the Project

If you have the project in a repository:

```bash
git clone <repository-url>
cd ddd
```

Or navigate to your project directory if you already have it.

### 2. Install Dependencies

Install all required npm packages:

```bash
npm install
```

This will install:
- NestJS framework and dependencies
- TypeORM and database drivers
- DDD library (`@nestjslatam/ddd-lib`)
- Testing frameworks
- Development tools

### 3. Verify Installation

Check that all dependencies are installed correctly:

```bash
npm list --depth=0
```

## Configuration

### Environment Variables

The application uses environment variables for configuration. Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration (SQLite for development)
DB_TYPE=sqlite
DB_DATABASE=db/ddd.sql

# For production, use PostgreSQL or MySQL:
# DB_TYPE=postgres
# DB_HOST=localhost
# DB_PORT=5432
# DB_USERNAME=your_username
# DB_PASSWORD=your_password
# DB_DATABASE=your_database
```

### Database Setup

The application uses SQLite by default for development. The database file will be created automatically at `db/ddd.sql` when you first run the application.

**Note**: For production, you should:
1. Use a production database (PostgreSQL, MySQL, etc.)
2. Set `synchronize: false` in TypeORM configuration
3. Use database migrations instead of auto-sync

## Running the Application

### Development Mode

Start the application in development mode with hot-reload:

```bash
npm run start:dev
```

The application will:
- Start on `http://localhost:3000` (or your configured PORT)
- Watch for file changes and automatically reload
- Show detailed error messages

### Production Mode

Build and run the application in production mode:

```bash
# Build the application
npm run build

# Run the production build
npm run start:prod
```

### Debug Mode

Start the application in debug mode:

```bash
npm run start:debug
```

This enables Node.js debugging. You can attach a debugger on port 9229.

## Testing the API

### Swagger Documentation

Once the application is running, access the Swagger UI:

**URL**: `http://localhost:3000/api`

Swagger provides:
- Interactive API documentation
- Try-it-out functionality
- Request/response schemas

### Using cURL

#### Create a Singer

```bash
curl -X POST http://localhost:3000/singers \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "picture": "https://example.com/picture.jpg"
  }'
```

#### Get Singer by ID

```bash
curl http://localhost:3000/singers/{id}
```

Replace `{id}` with an actual singer ID.

#### Get All Singers

```bash
curl http://localhost:3000/singers
```

#### Subscribe a Singer

```bash
curl -X POST http://localhost:3000/singers/{id}/subscribe \
  -H "Content-Type: application/json"
```

#### Change Singer Full Name

```bash
curl -X PUT http://localhost:3000/singers/{id}/fullname \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Jane Doe"
  }'
```

#### Add Song to Singer

```bash
curl -X POST http://localhost:3000/singers/{singerId}/songs \
  -H "Content-Type: application/json" \
  -d '{
    "songName": "My Song"
  }'
```

### Using Postman

1. Import the Swagger JSON from `http://localhost:3000/api-json`
2. Or manually create requests based on the Swagger documentation
3. Test all endpoints interactively

## Project Structure

Understanding the project structure will help you navigate the codebase:

```
ddd/
├── src/                          # Source code
│   ├── main.ts                  # Application entry point
│   ├── app.module.ts            # Root module
│   ├── shared/                  # Shared module
│   │   ├── application/        # Base classes, context
│   │   ├── domain/             # Shared value objects
│   │   └── exceptions/         # Custom exceptions
│   └── singers/                 # Singers domain module
│       ├── application/        # Application layer
│       │   ├── dto/           # Data Transfer Objects
│       │   ├── sagas/         # Long-running processes
│       │   └── use-cases/     # Commands and Queries
│       ├── domain/            # Domain layer
│       │   ├── events/        # Domain events
│       │   ├── singer.ts     # Singer aggregate
│       │   └── song.ts       # Song entity
│       └── infrastructure/    # Infrastructure layer
│           ├── db/           # Repositories and tables
│           └── mappers/      # Domain ↔ Database mappers
├── docs/                       # Documentation
├── db/                        # Database files
├── test/                      # E2E tests
├── package.json               # Dependencies and scripts
└── tsconfig.json              # TypeScript configuration
```

For detailed information, see:
- [Architecture Overview](architecture.md)
- [Domain Layer](domain-layer.md)
- [Application Layer](application-layer.md)
- [Infrastructure Layer](infrastructure-layer.md)

## Next Steps

### 1. Explore the Codebase

- Start with `src/main.ts` to understand application bootstrap
- Review `src/singers/domain/singer.ts` to see domain model
- Check `src/singers/application/use-cases/commands/create-singer/` for a complete use case

### 2. Read the Documentation

- [Architecture Overview](architecture.md) - Understand the overall design
- [Domain Layer](domain-layer.md) - Learn about domain models
- [Application Layer](application-layer.md) - Understand CQRS pattern
- [API Reference](api-reference.md) - Complete API documentation

### 3. Run Tests

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run end-to-end tests
npm run test:e2e
```

### 4. Create Your Own Module

Follow the `singers` module as a template:

1. Create a new domain module (e.g., `albums`)
2. Define domain entities and value objects
3. Create commands and queries
4. Implement repositories and mappers
5. Register the module in `app.module.ts`

### 5. Customize Configuration

- Update database configuration for your needs
- Add environment-specific settings
- Configure logging and monitoring
- Set up CI/CD pipelines

## Troubleshooting

### Common Issues

#### Port Already in Use

**Error**: `EADDRINUSE: address already in use :::3000`

**Solution**: 
- Change the PORT in `.env` file
- Or kill the process using port 3000:
  ```bash
  # Windows
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F
  
  # Linux/Mac
  lsof -ti:3000 | xargs kill
  ```

#### Database Connection Errors

**Error**: Database connection failed

**Solution**:
- Ensure database file exists: `db/ddd.sql`
- Check database configuration in `singers.module.ts`
- Verify SQLite is installed (for development)

#### Module Not Found

**Error**: Cannot find module '@nestjslatam/ddd-lib'

**Solution**:
- Run `npm install` again
- Check that the library is in `package.json`
- Verify `tsconfig.json` path mappings

#### TypeScript Errors

**Error**: Type errors during build

**Solution**:
- Run `npm run lint` to check for issues
- Ensure all dependencies are installed
- Check TypeScript version compatibility

## Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [CQRS Pattern](https://martinfowler.com/bliki/CQRS.html)

## Getting Help

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review the documentation in the `docs/` folder
3. Check existing issues in the repository
4. Create a new issue with detailed information

## Related Documentation

- [Architecture Overview](architecture.md)
- [API Reference](api-reference.md)
- [Domain Layer](domain-layer.md)
- [Application Layer](application-layer.md)
