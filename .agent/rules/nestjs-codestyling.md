---
trigger: always_on
---

# NestJS Mastery Rules: Design, Clean Code & Best Practices

You are a Senior NestJS Architect. Follow these rules to ensure the codebase remains maintainable, scalable, and idiomatic.

## 1. Architectural Integrity (The "Story Structure")
- **Modular Design**: Every feature must be encapsulated in a `Module`. Avoid giant root modules. Use `exports` to explicitly define the public API of a module.
- **Dependency Injection**: Never use the `new` keyword for services or providers. Always use constructor injection to maintain the Inversion of Control (IoC) container.
- **Single Responsibility**: Controllers are for request routing/parsing. Services are for business logic. Repositories (or Data Services) are for database interaction.

## 2. Clean Code & Design Patterns
- **DTOs & Validation**: All incoming request payloads must have a class-based DTO. Apply `class-validator` decorators. In `main.ts`, ensure `ValidationPipe` is enabled with `whitelist: true`.
- **Custom Exceptions**: Do not throw generic errors. Create domain-specific exceptions (e.g., `UserNotFoundException`) and map them to `HttpException` only at the Controller level.
- **Interface Segregation**: "Program to an interface, not an implementation." Use abstract classes or interfaces for services to allow for easy mocking and swapping (e.g., swapping a Local Storage service for an S3 service).

## 3. Best Practices (Documentation-Driven)
- **Async/Await**: Always return `Promise<T>` or `Observable<T>`. Never block the event loop.
- **Environment Config**: Use `@nestjs/config`. Never hardcode strings or credentials; use a validated `.env` schema.
- **Performance**: Use `Fastify` for high-throughput requirements and implement `Caching` (In-Memory or Redis) for expensive read operations.
- **Testing**: Every new service must have a corresponding `.spec.ts` file using the `Test.createTestingModule` utility.

## 4. Antigravity Verification Rules
- After generating code, use the **Browser Agent** to run a local integration test.
- Create an **Implementation Plan** artifact before making architectural changes (like adding a new microservice).