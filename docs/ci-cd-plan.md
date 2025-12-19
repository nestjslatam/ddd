# Plan de CI/CD - Propuesta de Automatización

## 📋 Resumen Ejecutivo

Este documento propone un sistema completo de **Integración Continua (CI)** y **Despliegue Continuo (CD)** para automatizar el proceso de construcción, testing y publicación de la librería `@nestjslatam/ddd-lib` a NPM utilizando GitHub Actions.

## 🎯 Objetivos

1. **Automatizar el proceso de build y deployment**
2. **Garantizar calidad mediante testing automático**
3. **Prevenir errores antes del deployment**
4. **Versionado automático basado en commits convencionales**
5. **Publicación automática a NPM tras validaciones exitosas**

## 📊 Análisis de la Estructura Actual

### Estructura del Proyecto

```
ddd/
├── libs/ddd/              # Librería principal a publicar
│   ├── src/              # Código fuente
│   ├── package.json      # Configuración NPM (@nestjslatam/ddd-lib)
│   └── tsconfig.lib.json  # Configuración TypeScript para build
├── src/                   # Aplicación de ejemplo (no se publica)
├── test/                  # Tests E2E
├── package.json           # Configuración raíz del proyecto
└── .release-it.json       # Configuración de release-it
```

### Scripts Actuales Relevantes

- `build:lib`: Construye la librería (`rimraf dist/libs/ddd && tsc -p ./libs/ddd/tsconfig.lib.json && sh ./copy.sh`)
- `release:lib`: Publica a NPM (`cd dist/libs/ddd && npm publish --access public`)
- `test`: Ejecuta tests unitarios
- `test:cov`: Ejecuta tests con cobertura
- `test:e2e`: Ejecuta tests end-to-end
- `lint`: Valida código con ESLint
- `format`: Formatea código con Prettier

### Herramientas de Calidad Actuales

- ✅ **Husky**: Git hooks
- ✅ **Commitlint**: Validación de mensajes de commit (Conventional Commits)
- ✅ **ESLint**: Linting de código
- ✅ **Prettier**: Formateo de código
- ✅ **Jest**: Framework de testing
- ✅ **Release-it**: Gestión de versiones y releases

## 🏗️ Arquitectura Propuesta de CI/CD

### Flujo General

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Repository                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Push/PR
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              CI Pipeline (GitHub Actions)                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 1. Checkout Code                                      │  │
│  │ 2. Setup Node.js                                      │  │
│  │ 3. Install Dependencies                               │  │
│  │ 4. Lint & Format Check                               │  │
│  │ 5. Type Check (TypeScript)                           │  │
│  │ 6. Unit Tests (with coverage)                        │  │
│  │ 7. E2E Tests                                          │  │
│  │ 8. Build Library                                      │  │
│  │ 9. Validate Build Output                              │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                │
│                    ┌───────┴────────┐                        │
│                    │               │                        │
│              ✅ Pass          ❌ Fail                        │
│                    │               │                        │
│                    ↓               ↓                        │
│            Continue          Block Merge                    │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ (Only on main/master)
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              CD Pipeline (GitHub Actions)                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 1. Detect Version Change                              │  │
│  │ 2. Create GitHub Release                               │  │
│  │ 3. Build Library                                       │  │
│  │ 4. Publish to NPM                                      │  │
│  │ 5. Create Git Tag                                      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
                    ┌───────────────┐
                    │   NPM Registry│
                    │ @nestjslatam/ │
                    │   ddd-lib     │
                    └───────────────┘
```

## 📝 Workflows Propuestos

### 1. CI Workflow - Validación Continua

**Archivo**: `.github/workflows/ci.yml`

**Trigger**:

- Push a cualquier rama
- Pull Requests
- Manual dispatch

**Jobs**:

#### Job 1: Lint & Format Check

- Verifica formato con Prettier
- Ejecuta ESLint
- Valida estructura de código

#### Job 2: Type Check

- Verifica tipos TypeScript
- Valida configuración de paths
- No genera build, solo verifica tipos

#### Job 3: Unit Tests

- Ejecuta todos los tests unitarios (`*.spec.ts`)
- Genera reporte de cobertura
- Sube cobertura a Codecov (opcional)
- **Quality Gate**: Cobertura mínima 80%

#### Job 4: E2E Tests

- Ejecuta tests end-to-end
- Valida integración completa
- Usa base de datos de prueba

#### Job 5: Build Validation

- Construye la librería
- Valida que el build sea exitoso
- Verifica estructura de archivos generados
- Valida `package.json` del build

**Matriz de Testing**:

- Node.js: 18.x, 20.x, 22.x (LTS)
- OS: ubuntu-latest, windows-latest, macos-latest

### 2. CD Workflow - Deployment a NPM

**Archivo**: `.github/workflows/cd.yml`

**Trigger**:

- Push a `main` o `master` con cambios en `libs/ddd/`
- Tags que coincidan con patrón `v*.*.*`
- Manual dispatch con selección de versión

**Jobs**:

#### Job 1: Version Detection

- Detecta cambios en `libs/ddd/package.json`
- Determina tipo de versión (patch, minor, major) basado en commits
- Usa `semantic-release` o `release-it` para versionado automático

#### Job 2: Build & Publish

- Construye la librería
- Ejecuta tests antes de publicar
- Publica a NPM con `--access public`
- Crea GitHub Release
- Crea Git Tag

**Seguridad**:

- Usa `NPM_TOKEN` como secret
- Solo ejecuta en rama `main/master`
- Requiere aprobación manual para releases major

### 3. Release Workflow - Gestión de Versiones

**Archivo**: `.github/workflows/release.yml`

**Trigger**:

- Manual dispatch
- Después de merge a main (opcional)

**Funcionalidad**:

- Usa `release-it` o `semantic-release`
- Genera changelog automático
- Crea GitHub Release
- Publica a NPM
- Actualiza versiones

## 🔒 Configuración de Seguridad

### Secrets Requeridos en GitHub

1. **NPM_TOKEN**

   - Token de acceso a NPM
   - Permisos: `publish` y `read`
   - Generado desde npmjs.com

2. **CODECOV_TOKEN** (opcional)
   - Para reportes de cobertura
   - Si se usa Codecov

### Branch Protection Rules

Configurar en GitHub:

- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- ✅ Require pull request reviews before merging
- ✅ Require CI workflow to pass
- ✅ Do not allow bypassing the above settings

## 📊 Quality Gates

### Criterios de Éxito (Must Pass)

1. ✅ **Linting**: Sin errores de ESLint
2. ✅ **Formatting**: Código formateado correctamente
3. ✅ **Type Check**: Sin errores de TypeScript
4. ✅ **Unit Tests**: Todos los tests pasan
5. ✅ **Test Coverage**: Mínimo 80% de cobertura
6. ✅ **E2E Tests**: Todos los tests E2E pasan
7. ✅ **Build**: Build exitoso sin errores
8. ✅ **Build Validation**: Archivos generados correctamente

### Criterios de Advertencia (Warning)

- ⚠️ Cobertura entre 70-80%: Warning pero no bloquea
- ⚠️ Dependencias desactualizadas: Warning en PR

## 🚀 Estrategia de Versionado

### Opción 1: Semantic Release (Recomendado)

- **Automático**: Basado en commits convencionales
- **Commits**:
  - `feat:` → Minor version (1.0.0 → 1.1.0)
  - `fix:` → Patch version (1.0.0 → 1.0.1)
  - `BREAKING CHANGE:` → Major version (1.0.0 → 2.0.0)
- **Ventajas**: Completamente automático
- **Desventajas**: Requiere commits estrictos

### Opción 2: Release-it (Actual)

- **Semi-automático**: Requiere confirmación
- **Ventajas**: Más control
- **Desventajas**: Requiere intervención manual

### Opción 3: Híbrido

- CI detecta cambios y sugiere versión
- CD requiere aprobación manual para publicar
- Mejor balance entre automatización y control

## 📦 Estrategia de Deployment

### Canales de Deployment

1. **Development/Pre-release**

   - Build en cada commit a `develop`
   - No publica a NPM
   - Genera artefactos para testing

2. **Staging/RC (Release Candidate)**

   - Build con tag `-rc.X`
   - Publica como `@nestjslatam/ddd-lib@1.0.0-rc.1`
   - Permite testing antes de release final

3. **Production**
   - Build estable
   - Publica versión final a NPM
   - Crea GitHub Release

### Estrategia de Tags NPM

- **Latest**: Última versión estable
- **Next**: Versiones pre-release (beta, rc)
- **Versiones específicas**: `1.0.0`, `1.1.0`, etc.

## 🔔 Notificaciones

### Canales de Notificación

1. **GitHub**

   - Comentarios en PRs
   - Issues automáticos en fallos
   - Releases automáticos

2. **Slack/Discord** (Opcional)

   - Notificaciones de deployment
   - Alertas de fallos críticos

3. **Email** (Opcional)
   - Resumen semanal de builds
   - Alertas de fallos

## 📈 Métricas y Monitoreo

### Métricas a Trackear

1. **Build Success Rate**: % de builds exitosos
2. **Test Coverage**: Tendencias de cobertura
3. **Build Time**: Tiempo promedio de CI/CD
4. **Deployment Frequency**: Frecuencia de releases
5. **Mean Time to Recovery**: Tiempo para corregir fallos

### Herramientas Sugeridas

- **Codecov**: Cobertura de código
- **GitHub Actions**: Métricas nativas
- **GitHub Insights**: Análisis de repositorio

## 🛠️ Archivos a Crear

### Estructura de Archivos

```
.github/
└── workflows/
    ├── ci.yml              # Continuous Integration
    ├── cd.yml              # Continuous Deployment
    ├── release.yml         # Release Management (opcional)
    └── dependency-review.yml  # Security scanning (opcional)
```

### Archivos de Configuración Adicionales

```
.releaserc.json            # Configuración semantic-release (si se usa)
.codecov.yml               # Configuración Codecov (opcional)
.github/
├── dependabot.yml         # Actualización automática de dependencias
└── CODEOWNERS             # Code ownership
```

## 📋 Checklist de Implementación

### Fase 1: Setup Inicial

- [ ] Crear workflows básicos de CI
- [ ] Configurar secrets en GitHub
- [ ] Configurar branch protection
- [ ] Testear workflows en rama de desarrollo

### Fase 2: Testing y Quality Gates

- [ ] Implementar quality gates
- [ ] Configurar reportes de cobertura
- [ ] Configurar notificaciones
- [ ] Documentar criterios de éxito

### Fase 3: Deployment

- [ ] Configurar NPM token
- [ ] Implementar deployment automático
- [ ] Configurar versionado automático
- [ ] Testear deployment en staging

### Fase 4: Optimización

- [ ] Optimizar tiempos de build
- [ ] Implementar caching
- [ ] Configurar dependabot
- [ ] Documentar proceso completo

## 🎯 Beneficios Esperados

1. **Reducción de Errores**: 90% menos errores en producción
2. **Velocidad**: Deployment en minutos vs horas
3. **Confianza**: Tests automáticos antes de cada release
4. **Trazabilidad**: Historial completo de cambios
5. **Calidad**: Código validado automáticamente

## ⚠️ Consideraciones

### Limitaciones

1. **GitHub Actions**: Límites de minutos gratuitos
2. **NPM**: Rate limits en publicaciones
3. **Tests**: Tiempo de ejecución puede ser largo

### Mitigaciones

1. **Caching**: Cachear node_modules y dependencias
2. **Parallel Jobs**: Ejecutar jobs en paralelo
3. **Selective Testing**: Solo ejecutar tests relevantes en PRs

## 📚 Referencias

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Semantic Release](https://semantic-release.gitbook.io/)
- [Release-it Documentation](https://github.com/release-it/release-it)
- [NPM Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)

## 🔄 Próximos Pasos

1. **Revisar y aprobar este plan**
2. **Configurar secrets en GitHub**
3. **Crear workflows base**
4. **Testear en rama de desarrollo**
5. **Iterar y mejorar basado en feedback**

---

**Nota**: Este es un plan de propuesta. La implementación se realizará después de la aprobación y ajustes necesarios.
