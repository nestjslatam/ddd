# Release v2.0.0 - DDD Library for NestJS

Major release with significant improvements and breaking changes.

## ✨ Features
- Updated DDD patterns and aggregate root implementation
- Enhanced validation orchestrator
- Improved state management and tracking
- Better TypeScript support with updated type definitions

## 💥 Breaking Changes
- Simplified library exports (removed deprecated APIs)
- Updated package structure  
- Removed DomainCommandBus, DomainEventBus (use NestJS CQRS directly)
- Updated to use simplified DddService

## 🐛 Fixes
- Fixed E2E tests for version 2.0.0 compatibility
- Fixed lint errors and code formatting
- Fixed build scripts and package distribution
- Adjusted Jest coverage thresholds
- Removed circular dependencies from package.json

## 📦 Installation
```bash
npm install @nestjslatam/ddd-lib@2.0.0
```

## 📚 Documentation
Full documentation available at [README](https://github.com/nestjslatam/ddd/blob/main/libs/ddd/README.md)

## 🔗 NPM Package
https://www.npmjs.com/package/@nestjslatam/ddd-lib/v/2.0.0

---

## Instrucciones para crear el Release en GitHub

1. Ve a: https://github.com/nestjslatam/ddd/releases/new
2. Selecciona el tag: **v2.0.0**
3. Título: **Release v2.0.0**
4. Copia y pega el contenido de este archivo en la descripción
5. Click en "Publish release"
