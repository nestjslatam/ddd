# Ejemplos de Workflows CI/CD

Este documento contiene ejemplos concretos de los workflows de GitHub Actions propuestos para el proyecto.

## 📋 Índice

1. [CI Workflow - Validación Continua](#1-ci-workflow)
2. [CD Workflow - Deployment a NPM](#2-cd-workflow)
3. [Release Workflow - Gestión de Versiones](#3-release-workflow)
4. [Workflow de Dependency Review](#4-dependency-review-workflow)
5. [Configuración Adicional](#5-configuración-adicional)

---

## 1. CI Workflow

**Archivo**: `.github/workflows/ci.yml`

```yaml
name: CI - Continuous Integration

on:
  push:
    branches: [main, develop, 'feature/**']
  pull_request:
    branches: [main, develop]
  workflow_dispatch:

env:
  NODE_VERSION: '20'
  COVERAGE_THRESHOLD: 80

jobs:
  # Job 1: Lint y Format Check
  lint-and-format:
    name: Lint & Format Check
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Check code formatting
        run: npm run format -- --check

      - name: Run ESLint
        run: npm run lint

  # Job 2: Type Check
  type-check:
    name: TypeScript Type Check
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Type check application
        run: npx tsc --noEmit -p tsconfig.json

      - name: Type check library
        run: npx tsc --noEmit -p libs/ddd/tsconfig.lib.json

  # Job 3: Unit Tests con Cobertura
  unit-tests:
    name: Unit Tests
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node-version: [18.x, 20.x, 22.x]
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests with coverage
        run: npm run test:cov

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          files: ./coverage/coverage-final.json
          flags: unittests
          name: codecov-umbrella
          fail_ci_if_error: false

      - name: Check coverage threshold
        run: |
          COVERAGE=$(node -e "const fs = require('fs'); const data = JSON.parse(fs.readFileSync('coverage/coverage-summary.json')); console.log(data.total.lines.pct);")
          if (( $(echo "$COVERAGE < ${{ env.COVERAGE_THRESHOLD }}" | bc -l) )); then
            echo "Coverage $COVERAGE% is below threshold ${{ env.COVERAGE_THRESHOLD }}%"
            exit 1
          fi
          echo "Coverage $COVERAGE% meets threshold ${{ env.COVERAGE_THRESHOLD }}%"

  # Job 4: E2E Tests
  e2e-tests:
    name: E2E Tests
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          DB_HOST: localhost
          DB_PORT: 5432
          DB_USERNAME: postgres
          DB_PASSWORD: postgres
          DB_DATABASE: test_db

  # Job 5: Build Validation
  build-validation:
    name: Build Library
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build library
        run: npm run build:lib

      - name: Validate build output
        run: |
          if [ ! -f "dist/libs/ddd/index.js" ]; then
            echo "Error: index.js not found in build output"
            exit 1
          fi
          if [ ! -f "dist/libs/ddd/package.json" ]; then
            echo "Error: package.json not found in build output"
            exit 1
          fi
          echo "Build output validated successfully"

      - name: Validate package.json
        run: |
          cd dist/libs/ddd
          node -e "const pkg = require('./package.json'); if (!pkg.name || !pkg.version) { process.exit(1); }"
          echo "package.json is valid"

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: library-build
          path: dist/libs/ddd
          retention-days: 7

  # Job 6: Security Scan (Opcional)
  security-scan:
    name: Security Scan
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run npm audit
        run: npm audit --audit-level=moderate
        continue-on-error: true

      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        continue-on-error: true
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high
```

---

## 2. CD Workflow

**Archivo**: `.github/workflows/cd.yml`

````yaml
name: CD - Continuous Deployment

on:
  push:
    branches:
      - main
      - master
    paths:
      - 'libs/ddd/**'
      - '.github/workflows/cd.yml'
      - 'package.json'
  release:
    types: [published]
  workflow_dispatch:
    inputs:
      version_type:
        description: 'Version type (patch, minor, major)'
        required: true
        type: choice
        options:
          - patch
          - minor
          - major

env:
  NODE_VERSION: '20'
  REGISTRY_URL: 'https://registry.npmjs.org'
  SCOPE: '@nestjslatam'

jobs:
  # Job 1: Version Detection y Preparación
  version-and-prepare:
    name: Version Detection
    runs-on: ubuntu-latest
    outputs:
      version: ${{ steps.version.outputs.version }}
      should_publish: ${{ steps.check.outputs.should_publish }}
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          registry-url: ${{ env.REGISTRY_URL }}
          scope: ${{ env.SCOPE }}

      - name: Install dependencies
        run: npm ci

      - name: Configure Git
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"

      - name: Get current version
        id: current_version
        run: |
          VERSION=$(node -p "require('./libs/ddd/package.json').version")
          echo "current=$VERSION" >> $GITHUB_OUTPUT

      - name: Determine version bump
        id: version
        uses: conventional-changelog/standard-version@v1
        with:
          release-as: ${{ github.event.inputs.version_type || 'patch' }}
          skip-tag: true
          skip-commit: true
        continue-on-error: true

      - name: Check if version changed
        id: check
        run: |
          NEW_VERSION=$(node -p "require('./libs/ddd/package.json').version")
          OLD_VERSION="${{ steps.current_version.outputs.current }}"
          if [ "$NEW_VERSION" != "$OLD_VERSION" ]; then
            echo "should_publish=true" >> $GITHUB_OUTPUT
            echo "Version will change from $OLD_VERSION to $NEW_VERSION"
          else
            echo "should_publish=false" >> $GITHUB_OUTPUT
            echo "No version change detected"
          fi

  # Job 2: Build y Publish
  build-and-publish:
    name: Build & Publish to NPM
    needs: version-and-prepare
    if: needs.version-and-prepare.outputs.should_publish == 'true'
    runs-on: ubuntu-latest
    environment:
      name: npm-publish
      url: https://www.npmjs.com/package/@nestjslatam/ddd-lib
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          registry-url: ${{ env.REGISTRY_URL }}
          scope: ${{ env.SCOPE }}

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: |
          npm run test:cov
          npm run test:e2e

      - name: Build library
        run: npm run build:lib

      - name: Validate build
        run: |
          cd dist/libs/ddd
          npm pack --dry-run

      - name: Publish to NPM
        run: |
          cd dist/libs/ddd
          npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}

      - name: Create GitHub Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: v${{ needs.version-and-prepare.outputs.version }}
          release_name: Release v${{ needs.version-and-prepare.outputs.version }}
          body: |
            ## Changes in this Release

            See [CHANGELOG.md](../../CHANGELOG.md) for details.

            ### Installation
            ```bash
            npm install @nestjslatam/ddd-lib@${{ needs.version-and-prepare.outputs.version }}
            ```
          draft: false
          prerelease: false

      - name: Create Git Tag
        run: |
          git tag -a "v${{ needs.version-and-prepare.outputs.version }}" -m "Release v${{ needs.version-and-prepare.outputs.version }}"
          git push origin "v${{ needs.version-and-prepare.outputs.version }}"
````

---

## 3. Release Workflow

**Archivo**: `.github/workflows/release.yml`

````yaml
name: Release Management

on:
  workflow_dispatch:
    inputs:
      release_type:
        description: 'Release type'
        required: true
        type: choice
        options:
          - patch
          - minor
          - major
          - prerelease
      prerelease_id:
        description: 'Prerelease ID (alpha, beta, rc)'
        required: false
        type: string

jobs:
  release:
    name: Create Release
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'
          scope: '@nestjslatam'

      - name: Install dependencies
        run: npm ci

      - name: Configure Git
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"

      - name: Generate changelog
        id: changelog
        uses: metcalfc/changelog-generator@v4.3.1
        with:
          myToken: ${{ secrets.GITHUB_TOKEN }}

      - name: Bump version
        run: |
          if [ "${{ github.event.inputs.release_type }}" == "prerelease" ]; then
            npm version prerelease --preid=${{ github.event.inputs.prerelease_id || 'beta' }} --no-git-tag-version
          else
            npm version ${{ github.event.inputs.release_type }} --no-git-tag-version
          fi
        working-directory: ./libs/ddd

      - name: Get new version
        id: version
        run: |
          VERSION=$(node -p "require('./libs/ddd/package.json').version")
          echo "version=$VERSION" >> $GITHUB_OUTPUT
          echo "New version: $VERSION"

      - name: Build library
        run: npm run build:lib

      - name: Run tests
        run: |
          npm run test:cov
          npm run test:e2e

      - name: Commit version bump
        run: |
          git add libs/ddd/package.json
          git commit -m "chore: bump version to ${{ steps.version.outputs.version }}"
          git push

      - name: Create Git tag
        run: |
          git tag -a "v${{ steps.version.outputs.version }}" -m "Release v${{ steps.version.outputs.version }}"
          git push origin "v${{ steps.version.outputs.version }}"

      - name: Publish to NPM
        run: |
          cd dist/libs/ddd
          npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v1
        with:
          tag_name: v${{ steps.version.outputs.version }}
          name: Release v${{ steps.version.outputs.version }}
          body: |
            ${{ steps.changelog.outputs.changelog }}

            ## Installation
            ```bash
            npm install @nestjslatam/ddd-lib@${{ steps.version.outputs.version }}
            ```
          draft: false
          prerelease: ${{ github.event.inputs.release_type == 'prerelease' }}
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
````

---

## 4. Dependency Review Workflow

**Archivo**: `.github/workflows/dependency-review.yml`

```yaml
name: Dependency Review

on:
  pull_request:
    branches: [main, develop]

permissions:
  contents: read

jobs:
  dependency-review:
    name: Review Dependencies
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Dependency Review
        uses: actions/dependency-review-action@v3
        with:
          fail-on-severity: moderate
```

---

## 5. Configuración Adicional

### 5.1. `.releaserc.json` (Para Semantic Release)

```json
{
  "branches": [
    "main",
    {
      "name": "beta",
      "prerelease": true
    }
  ],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    "@semantic-release/npm",
    "@semantic-release/github"
  ],
  "pkgRoot": "dist/libs/ddd",
  "npmPublish": true
}
```

### 5.2. `.codecov.yml`

```yaml
codecov:
  token: ${{ secrets.CODECOV_TOKEN }}
  files:
    - ./coverage/coverage-final.json
  flags:
    unittests:
      paths:
        - src/
        - libs/ddd/src/
  coverage:
    status:
      project:
        default:
          target: 80%
          threshold: 1%
      patch:
        default:
          target: 80%
```

### 5.3. `.github/dependabot.yml`

```yaml
version: 2
updates:
  - package-ecosystem: 'npm'
    directory: '/'
    schedule:
      interval: 'weekly'
    open-pull-requests-limit: 10
    reviewers:
      - 'your-username'
    labels:
      - 'dependencies'
      - 'automated'
    commit-message:
      prefix: 'chore'
      include: 'scope'
```

### 5.4. `.github/CODEOWNERS`

```
# Global owners
* @your-username

# Library specific
/libs/ddd/ @your-username @team-member

# Documentation
/docs/ @your-username

# CI/CD
/.github/ @your-username
```

---

## 📝 Notas de Implementación

### Orden de Implementación Recomendado

1. **Fase 1**: Implementar CI workflow básico (lint, type-check, tests)
2. **Fase 2**: Agregar build validation y coverage
3. **Fase 3**: Implementar CD workflow con publicación manual
4. **Fase 4**: Automatizar versionado y publicación
5. **Fase 5**: Agregar workflows adicionales (dependabot, security)

### Secrets a Configurar

1. Ir a: `Settings > Secrets and variables > Actions`
2. Agregar:
   - `NPM_TOKEN`: Token de NPM con permisos de publicación
   - `CODECOV_TOKEN`: (Opcional) Token de Codecov
   - `SNYK_TOKEN`: (Opcional) Token de Snyk

### Testing de Workflows

1. Crear rama `feature/ci-cd-setup`
2. Agregar workflows
3. Hacer PR y verificar que se ejecuten
4. Testear manualmente con `workflow_dispatch`
5. Merge a main cuando esté validado

---

**Nota**: Estos son ejemplos de referencia. Ajustar según necesidades específicas del proyecto.
