# Checklist de Configuración CI/CD

Use este checklist para configurar el sistema CI/CD después de la implementación.

## ✅ Pre-requisitos

- [ ] Repositorio en GitHub
- [ ] Acceso de administrador al repositorio
- [ ] Cuenta en NPM con permisos de publicación
- [ ] Node.js y npm instalados localmente

## 🔐 Configuración de Secrets

### NPM_TOKEN (Requerido)

**IMPORTANTE**: Debe ser un token de tipo **Automation** (no requiere 2FA)

- [ ] Ir a [npmjs.com](https://www.npmjs.com/settings/YOUR_USERNAME/tokens)
- [ ] Click en "Generate New Token"
- [ ] Seleccionar tipo: **"Automation"** (NO "Granular" ni "Classic")
- [ ] Configurar permisos:
  - ✅ Read packages
  - ✅ Publish packages
- [ ] Copiar el token generado (solo se muestra una vez)
- [ ] En GitHub: `Settings > Secrets and variables > Actions`
- [ ] Click en "New repository secret"
- [ ] Nombre: `NPM_TOKEN`
- [ ] Valor: Pegar el token copiado
- [ ] Click en "Add secret"

**Nota**: Los tokens de tipo "Automation" no requieren 2FA y son ideales para CI/CD.

### CODECOV_TOKEN (Opcional)

- [ ] Crear cuenta en [codecov.io](https://codecov.io)
- [ ] Conectar repositorio de GitHub
- [ ] Copiar token de Codecov
- [ ] En GitHub: Agregar secret `CODECOV_TOKEN`
- [ ] Pegar token y guardar

## 🛡️ Branch Protection

- [ ] Ir a: `Settings > Branches`
- [ ] Click en "Add rule" o editar regla existente
- [ ] Branch name pattern: `main` o `master`
- [ ] Marcar: "Require a pull request before merging"
- [ ] Marcar: "Require status checks to pass before merging"
  - [ ] Seleccionar: `lint-and-format`
  - [ ] Seleccionar: `type-check`
  - [ ] Seleccionar: `unit-tests`
  - [ ] Seleccionar: `e2e-tests`
  - [ ] Seleccionar: `build-validation`
- [ ] Marcar: "Require branches to be up to date before merging"
- [ ] Marcar: "Do not allow bypassing the above settings"
- [ ] Guardar cambios

## 🌍 Environment (Opcional)

- [ ] Ir a: `Settings > Environments`
- [ ] Click en "New environment"
- [ ] Nombre: `npm-publish`
- [ ] (Opcional) Agregar reviewers para aprobación manual
- [ ] Guardar

## 🧪 Testing de Workflows

### Test CI Workflow

- [ ] Crear rama de prueba: `git checkout -b test/ci-workflow`
- [ ] Hacer un cambio menor (ej: agregar comentario)
- [ ] Commit y push: `git push origin test/ci-workflow`
- [ ] Ir a: `Actions` en GitHub
- [ ] Verificar que el workflow CI se ejecuta
- [ ] Verificar que todos los jobs pasan
- [ ] Crear Pull Request
- [ ] Verificar que CI se ejecuta en el PR
- [ ] Verificar que los checks aparecen en el PR

### Test CD Workflow (Manual)

- [ ] Ir a: `Actions > CD - Continuous Deployment`
- [ ] Click en "Run workflow"
- [ ] Seleccionar rama: `main` o `master`
- [ ] Seleccionar version type: `patch`
- [ ] Click en "Run workflow"
- [ ] Verificar que el workflow se ejecuta
- [ ] **NOTA**: Esto publicará a NPM, usar solo si estás seguro

### Test Release Workflow

- [ ] Ir a: `Actions > Release Management`
- [ ] Click en "Run workflow"
- [ ] Seleccionar release type: `prerelease`
- [ ] Prerelease ID: `beta`
- [ ] Click en "Run workflow"
- [ ] Verificar que se crea versión beta
- [ ] Verificar que se publica a NPM como pre-release

## 📊 Verificación Final

- [ ] CI se ejecuta en cada push
- [ ] CI se ejecuta en cada PR
- [ ] Todos los jobs de CI pasan
- [ ] Coverage se reporta correctamente
- [ ] Build validation funciona
- [ ] CD detecta cambios en `libs/ddd/`
- [ ] Release workflow funciona manualmente
- [ ] Dependabot está activo (verificar en `Settings > Code security and analysis`)

## 🐛 Troubleshooting Común

### CI no se ejecuta

- [ ] Verificar que los archivos están en `.github/workflows/`
- [ ] Verificar sintaxis YAML (usar validador online)
- [ ] Verificar que el workflow tiene `on:` configurado

### Tests fallan en CI pero pasan localmente

- [ ] Verificar versión de Node.js
- [ ] Ejecutar `npm ci` localmente (no `npm install`)
- [ ] Verificar que todas las dependencias están en `package.json`

### CD no detecta cambios

- [ ] Verificar que los cambios están en `libs/ddd/`
- [ ] Verificar paths en `cd.yml`
- [ ] Verificar que el push es a `main` o `master`

### Publicación a NPM falla

- [ ] Verificar que `NPM_TOKEN` está configurado
- [ ] Verificar permisos del token
- [ ] Verificar que la versión no existe ya en NPM
- [ ] Verificar `package.json` en `libs/ddd/`

### Error EOTP (One-Time Password Required)

**Síntoma**: `npm error code EOTP - This operation requires a one-time password from your authenticator`

**Causa**: El token NPM que estás usando requiere 2FA (two-factor authentication), pero los tokens Automation no deberían requerirlo.

**Solución**:

1. Ir a [npmjs.com/tokens](https://www.npmjs.com/settings/YOUR_USERNAME/tokens)
2. Eliminar el token actual (si es necesario)
3. Crear un **nuevo token de tipo "Automation"** (NO "Granular" ni "Classic")
4. Copiar el nuevo token
5. Actualizar el secret `NPM_TOKEN` en GitHub con el nuevo token
6. Volver a ejecutar el workflow

**Nota**: Los tokens Automation están diseñados específicamente para CI/CD y no requieren 2FA.

## 📝 Notas

- Los workflows están listos para usar
- Ajustar `COVERAGE_THRESHOLD` en `ci.yml` si es necesario
- Revisar `CODEOWNERS` y actualizar usuarios según necesidad
- Dependabot se activará automáticamente

## ✅ Estado Final

Una vez completado este checklist:

- [x] CI/CD está completamente configurado
- [x] Listo para desarrollo continuo
- [x] Listo para deployment automático

---

**Fecha de configuración**: **\*\***\_\_\_**\*\***

**Configurado por**: **\*\***\_\_\_**\*\***
