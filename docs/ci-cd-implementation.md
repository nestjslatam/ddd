# Guía de Implementación CI/CD

Esta guía describe cómo se ha implementado el sistema de CI/CD y cómo utilizarlo.

## 📋 Índice

- [Workflows Implementados](#workflows-implementados)
- [Configuración Inicial](#configuración-inicial)
- [Uso de los Workflows](#uso-de-los-workflows)
- [Troubleshooting](#troubleshooting)
- [Mantenimiento](#mantenimiento)

## Workflows Implementados

### 1. CI Workflow (`.github/workflows/ci.yml`)

**Propósito**: Validación continua del código en cada push y PR.

**Jobs**:

- ✅ **lint-and-format**: Verifica formato y linting
- ✅ **type-check**: Verifica tipos TypeScript
- ✅ **unit-tests**: Ejecuta tests unitarios con cobertura
- ✅ **e2e-tests**: Ejecuta tests end-to-end
- ✅ **build-validation**: Valida que el build sea exitoso
- ✅ **security-scan**: Escanea vulnerabilidades

**Triggers**:

- Push a cualquier rama
- Pull Requests
- Ejecución manual

### 2. CD Workflow (`.github/workflows/cd.yml`)

**Propósito**: Deployment automático a NPM cuando hay cambios en la librería.

**Jobs**:

- ✅ **version-and-prepare**: Detecta y actualiza versión
- ✅ **build-and-publish**: Construye y publica a NPM

**Triggers**:

- Push a `main`/`master` con cambios en `libs/ddd/`
- Ejecución manual con selección de versión

### 3. Release Workflow (`.github/workflows/release.yml`)

**Propósito**: Gestión manual de releases con control total.

**Características**:

- Selección de tipo de release (patch, minor, major, prerelease)
- Generación automática de changelog
- Creación de GitHub Release
- Publicación a NPM

**Triggers**:

- Ejecución manual únicamente

## Configuración Inicial

### 1. Configurar Secrets en GitHub

Ir a: `Settings > Secrets and variables > Actions`

#### NPM_TOKEN (Requerido)

**⚠️ IMPORTANTE**: Debe ser un token de tipo **Automation** para evitar errores de 2FA.

1. Ir a [npmjs.com](https://www.npmjs.com/settings/YOUR_USERNAME/tokens)
2. Click en "Generate New Token"
3. **Seleccionar tipo: "Automation"** (NO "Granular" ni "Classic")
   - Los tokens Automation no requieren 2FA y son ideales para CI/CD
4. Configurar permisos:
   - ✅ Read packages
   - ✅ Publish packages
5. Copiar el token (solo se muestra una vez)
6. En GitHub: `Settings > Secrets and variables > Actions`
7. Agregar nuevo secret: `NPM_TOKEN`
8. Pegar el token y guardar

**Si obtienes error EOTP (one-time password)**: Significa que estás usando un token que requiere 2FA. Debes crear un token de tipo "Automation" en su lugar.

#### CODECOV_TOKEN (Opcional)

1. Crear cuenta en [codecov.io](https://codecov.io)
2. Conectar repositorio
3. Copiar token
4. Agregar como secret `CODECOV_TOKEN`

### 2. Configurar Branch Protection

Ir a: `Settings > Branches > Branch protection rules`

**Para rama `main` o `master`**:

- ✅ Require a pull request before merging
- ✅ Require status checks to pass before merging
  - Seleccionar: `lint-and-format`, `type-check`, `unit-tests`, `e2e-tests`, `build-validation`
- ✅ Require branches to be up to date before merging
- ✅ Do not allow bypassing the above settings

### 3. Configurar Environment (Opcional)

Para el workflow de CD, se puede crear un environment `npm-publish`:

1. Ir a: `Settings > Environments`
2. Crear nuevo environment: `npm-publish`
3. Agregar reviewers si se requiere aprobación manual

## Uso de los Workflows

### CI Workflow (Automático)

El workflow CI se ejecuta automáticamente en:

- Cada push a cualquier rama
- Cada Pull Request
- Ejecución manual desde la pestaña "Actions"

**No requiere acción manual** - se ejecuta automáticamente.

### CD Workflow (Automático con Opción Manual)

#### Modo Automático

Se ejecuta automáticamente cuando:

- Se hace push a `main`/`master`
- Hay cambios en `libs/ddd/`
- El workflow CI pasa exitosamente

**Versionado automático**:

- `feat:` → Minor version (1.0.0 → 1.1.0)
- `fix:` → Patch version (1.0.0 → 1.0.1)
- `BREAKING CHANGE:` → Major version (1.0.0 → 2.0.0)

#### Modo Manual

1. Ir a: `Actions > CD - Continuous Deployment`
2. Click en "Run workflow"
3. Seleccionar tipo de versión:
   - `patch`: 1.0.0 → 1.0.1
   - `minor`: 1.0.0 → 1.1.0
   - `major`: 1.0.0 → 2.0.0
4. Click en "Run workflow"

### Release Workflow (Manual)

Para crear un release manual:

1. Ir a: `Actions > Release Management`
2. Click en "Run workflow"
3. Seleccionar:
   - **Release type**: patch, minor, major, o prerelease
   - **Prerelease ID** (si es prerelease): alpha, beta, rc
4. Click en "Run workflow"

**Resultado**:

- ✅ Versión actualizada en `libs/ddd/package.json`
- ✅ Build y tests ejecutados
- ✅ Publicación a NPM
- ✅ Git tag creado
- ✅ GitHub Release creado

## Troubleshooting

### Error: NPM_TOKEN no encontrado

**Solución**:

1. Verificar que el secret existe en GitHub
2. Verificar que el nombre es exactamente `NPM_TOKEN`
3. Verificar permisos del token NPM

### Error: Build falla en CI

**Posibles causas**:

- Dependencias desactualizadas
- Errores de TypeScript
- Tests fallando

**Solución**:

1. Ejecutar localmente: `npm ci && npm run build:lib`
2. Revisar logs del workflow
3. Corregir errores localmente antes de hacer push

### Error: Coverage por debajo del threshold

**Solución**:

1. Revisar reporte de cobertura
2. Agregar tests para código no cubierto
3. Ajustar threshold si es necesario (en `ci.yml`)

### Error: Versionado automático no funciona

**Solución**:

1. Verificar que los commits siguen Conventional Commits
2. Usar workflow manual de Release si es necesario
3. Verificar logs del job `version-and-prepare`

### Error: Publicación a NPM falla

**Posibles causas**:

- Versión ya existe en NPM
- Token sin permisos
- Package name incorrecto

**Solución**:

1. Verificar que la versión no existe: `npm view @nestjslatam/ddd-lib versions`
2. Verificar permisos del token
3. Verificar `package.json` en `libs/ddd/`

## Mantenimiento

### Actualizar Dependencias

Dependabot creará PRs automáticamente cada lunes.

Para actualizar manualmente:

```bash
npm update
npm audit fix
```

### Ajustar Quality Gates

Editar `.github/workflows/ci.yml`:

```yaml
env:
  COVERAGE_THRESHOLD: 80 # Ajustar según necesidades
```

### Agregar Nuevos Tests

1. Crear archivos `*.spec.ts`
2. Los tests se ejecutarán automáticamente en CI
3. Verificar cobertura en reportes

### Monitoreo

- **GitHub Actions**: Ver ejecuciones en pestaña "Actions"
- **NPM**: Verificar publicaciones en [npmjs.com](https://www.npmjs.com/package/@nestjslatam/ddd-lib)
- **Codecov**: Ver cobertura en [codecov.io](https://codecov.io)

## Mejores Prácticas

### Commits

Usar Conventional Commits para versionado automático:

```
feat: add new feature
fix: fix bug
docs: update documentation
chore: bump version
BREAKING CHANGE: major change
```

### Pull Requests

1. Crear PR desde feature branch
2. Esperar que CI pase
3. Solicitar review
4. Merge solo cuando CI esté verde

### Releases

1. Usar Release workflow para releases importantes
2. Verificar changelog antes de publicar
3. Comunicar releases al equipo

## Referencias

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [NPM Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Codecov Documentation](https://docs.codecov.com/)

---

**Última actualización**: Implementación inicial completada
