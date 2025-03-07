# Configuration

<div align="center">
  <img src="https://img.shields.io/badge/Configuration-Comprehensive-blue" alt="Configuration">
  <img src="https://img.shields.io/badge/TypeScript-5.8.2-blue" alt="TypeScript">
  <img src="https://img.shields.io/badge/ESLint-9.21.0-purple" alt="ESLint">
  <img src="https://img.shields.io/badge/Bun-Latest-orange" alt="Bun">
</div>

## Table of Contents

- [Environment Variables](#environment-variables)
- [Runtime Configuration](#runtime-configuration)
- [Development Tools](#development-tools)
  - [TypeScript Configuration](#typescript-configuration)
  - [Code Quality Tools](#code-quality-tools)
  - [Testing Configuration](#testing-configuration)
- [CI/CD Configuration](#cicd-configuration)
- [Best Practices](#best-practices)

## Environment Variables

The application uses environment variables for sensitive configuration that shouldn't be committed to the repository.

| Variable           | Required | Description                                 | Example                   |
| ------------------ | :------: | ------------------------------------------- | ------------------------- |
| `OPEN_WEATHER_KEY` |    ✅    | OpenWeather API key for weather data access | `a1b2c3d4e5f6g7h8i9j0...` |

### Environment Loading

Environment variables are loaded using the `dotenv` package in `src/utils/preload.ts`. This module is automatically executed at application startup through the Bun preload mechanism configured in `bunfig.toml`.

### Validation

The application performs strict validation of required environment variables:

```typescript
// From src/utils/preload.ts
export function ensureEnvironmentVariables(): void {
  if (
    !process.env.OPEN_WEATHER_KEY ||
    process.env.OPEN_WEATHER_KEY.trim() === ''
  ) {
    console.error(
      '[preload.ts] ❌ Missing required environment variable: OPEN_WEATHER_KEY',
    );
    throw new Error(
      '[preload.ts] ❌ Missing required environment variable: OPEN_WEATHER_KEY',
    );
  }

  console.warn('[preload.ts] ✅ Environment variables loaded successfully');
}
```

## Runtime Configuration

### bunfig.toml

The `bunfig.toml` file configures the Bun runtime environment with optimized settings for the application.

```toml
# 🚀 Bun Configuration for profile-weather-view

# Reduce memory usage at the cost of performance (disabled for speed)
smol = false

# Set log level (debug, warn, error)
logLevel = "warn"

# Enable OpenWeather API key preload (Auto-load environment variables)
preload = ["./src/utils/preload.ts"]

# Ensure Node.js aliases to Bun for smooth execution
[run]
bun = true

# ✅ TypeScript Loader
[loader]
".ts" = "ts"

# ✅ Optimized Package Installation Behavior
[install]
optional = true
dev = true
peer = true
production = false
exact = false
auto = "fallback"
frozenLockfile = false
saveTextLockfile = false
esm = true

# Registry (default to npm)
registry = "https://registry.npmjs.org"
```

**Key Features:**

- Automatic preloading of environment variables
- TypeScript loader configuration
- Optimized package installation settings
- Registry configuration for dependencies

## Development Tools

### TypeScript Configuration

The `tsconfig.json` file enforces strict type checking and configures path aliases for cleaner imports.

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "Node",
    "baseUrl": "./",
    "rootDir": "src",
    "outDir": "dist",
    "lib": ["ESNext"],
    "strict": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "exactOptionalPropertyTypes": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "importHelpers": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noEmit": true,
    "verbatimModuleSyntax": true,
    "erasableSyntaxOnly": true,
    "allowUnusedLabels": false,
    "allowUnreachableCode": false,
    "paths": {
      "@/index": ["src/index"],
      "@/config/*": ["src/config/*"],
      "@/services/*": ["src/services/*"],
      "@/utils/*": ["src/utils/*"],
      "@/test/*": ["src/__tests__/*"]
    }
  },
  "include": ["src", "src/__tests__"],
  "exclude": ["node_modules", "dist", "tmp", "coverage"]
}
```

**Key Features:**

- ESNext target for modern JavaScript features
- Strict type checking enabled
- Path aliases for cleaner imports (`@/services/*`, etc.)
- Comprehensive safety rules enabled

The project also includes `tsconfig.test.json` which extends the base configuration with test-specific settings.

### Code Quality Tools

#### ESLint Configuration (eslint.config.mjs)

The ESLint configuration uses a modular approach with specialized rule sets:

```javascript
// Modular rule imports
import { getParserProjects } from './src/config/parser.config.mjs';
import { getPrettierRules } from './src/config/eslint-prettier.config.mjs';
import { getSortRules } from './src/config/sort.config.mjs';
import { getStylisticRules } from './src/config/stylistic.config.mjs';
import { getUnicornRules } from './src/config/unicorn.config.mjs';
import { getSecurityRules } from './src/config/security.config.mjs';
import { getCommentsRules } from './src/config/comments.config.mjs';
```

**Configured Plugins:**

- `typescript-eslint`: TypeScript-specific linting
- `eslint-plugin-sonarjs`: Detects code smells
- `eslint-plugin-unicorn`: Modern JavaScript best practices
- `eslint-plugin-security`: Security vulnerability detection
- `eslint-plugin-perfectionist`: Code organization and sorting
- `eslint-plugin-stylistic`: Consistent code style
- `eslint-plugin-prettier`: Prettier integration
- `eslint-plugin-eslint-comments`: Comment validation

#### Prettier Configuration (prettier.config.mjs)

```javascript
/** @type {import("prettier").Config} */
const prettierConfig = {
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 80,
  tabWidth: 2,
  arrowParens: 'always',
  endOfLine: 'lf',
};

export default prettierConfig;
```

#### Commitlint Configuration (commitlint.config.cjs)

Enforces conventional commit messages for better repository history.

```javascript
// commitlint.config.cjs
module.exports = {
  extends: ['@commitlint/config-conventional'],
};
```

### Testing Configuration

#### Vitest Configuration (vitest.config.ts)

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      reporter: ['text', 'json', 'html'], // Generates coverage reports
      include: ['src/**'], // ✅ Only include the `src` directory
      exclude: [
        'src/config/**', // ❌ Ignore ESLint & config files
        'src/__tests__/**', // ❌ Ignore test files (tests don't need coverage)
      ],
    },
    environment: 'node', // Simulates Node.js
    globals: true, // Allows global `expect`
    alias: {
      '@/': new URL('./src/', import.meta.url).pathname, // ✅ Fix path aliasing
    },
  },
});
```

**Key Features:**

- Coverage reporting configuration
- Node.js testing environment
- Path alias support for cleaner imports in tests

## CI/CD Configuration

### GitHub Actions Workflow

The `.github/workflows/update-readme.yml` file configures the automated workflow for updating the README with weather data.

```yaml
name: Readme Weather Update

# 🚀 Trigger Mechanisms for GitHub Actions
on:
  schedule:
    - cron: '0 */8 * * *' # Runs automatically every 8 hours
  workflow_dispatch: # Allows manual triggering

jobs:
  update-readme-weather:
    runs-on: ubuntu-latest

    # 🏎️ Strategy matrix to parallelize tasks
    strategy:
      matrix:
        task:
          [
            checkout-repos,
            setup-bun,
            install-deps,
            fetch-weather,
            update-readme,
            commit-push,
          ]

    steps:
      # Steps for each task...
```

**Key Features:**

- **Automated Scheduling**: Runs every 8 hours via cron expression
- **Manual Trigger**: Can be triggered manually with `workflow_dispatch`
- **Parallelization**: Uses a matrix strategy to run tasks in parallel
- **Workflow Steps**:
  1. Repository checkout (both the script and personal repositories)
  2. Bun runtime setup
  3. Dependency installation
  4. Weather data fetching
  5. README file updating
  6. Change committing and pushing

**Authentication & Security:**

- Uses GitHub's OpenID Connect (OIDC) for secure authentication
- Configures Git for commit signing using GitHub's built-in GPG
- Only commits changes when the README has actually been modified

**Artifact Handling:**

- Uploads weather data as artifacts to persist between jobs
- Downloads artifacts when needed by subsequent steps

## Best Practices

### Environment Variables

1. **Never commit `.env` files to the repository**
2. Use environment variables for all sensitive information
3. Document all required environment variables
4. Validate environment variables at application startup

### Configuration Management

1. **Modular Configuration**: Split complex configurations into separate files
2. **Typed Configuration**: Use TypeScript interfaces for configuration objects
3. **Validation**: Validate all configuration at startup
4. **Fail Fast**: Crash early if configuration is invalid

### CI/CD Pipeline

1. **Automatic Scheduling**: Set appropriate intervals for data updates
2. **Manual Override**: Always provide a manual trigger option
3. **Artifact Sharing**: Use artifacts to share data between workflow steps
4. **Idempotent Operations**: Only make changes when necessary

---

<div align="center">
  <p>
    <strong>Profile Weather View</strong> | Configuration Documentation
  </p>
  <p>
    <small>For questions about configuration, please open an issue in the repository.</small>
  </p>
</div>
