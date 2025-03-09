<div align="center">
  <h1>Configuration</h1>
</div>

<br>

<div align="center" style="display: flex; justify-content: center; gap: 5px; flex-wrap: wrap;">
  <img src="https://img.shields.io/badge/Configuration-Standard-blue" alt="Configuration">
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

The application performs validation of required environment variables:

```typescript
// From src/utils/preload.ts
export function ensureEnvironmentVariables(): void {
  if (
    !process.env.OPEN_WEATHER_KEY ||
    process.env.OPEN_WEATHER_KEY.trim() === ''
  ) {
    console.error(
      '[preload.ts] Missing required environment variable: OPEN_WEATHER_KEY',
    );
    throw new Error(
      '[preload.ts] Missing required environment variable: OPEN_WEATHER_KEY',
    );
  }

  console.log('[preload.ts] Environment variables loaded successfully');
}
```

## Runtime Configuration

### bunfig.toml

The `bunfig.toml` file configures the Bun runtime environment with settings for the application.

```toml
# Bun Configuration for profile-weather-view

# Reduce memory usage at the cost of performance (disabled for speed)
smol = false

# Set log level (debug, warn, error)
logLevel = "warn"

# Enable OpenWeather API key preload (Auto-load environment variables)
preload = ["./src/utils/preload.ts"]

# Ensure Node.js aliases to Bun for smooth execution
[run]
bun = true

# TypeScript Loader
[loader]
".ts" = "ts"

# Package Installation Behavior
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
- Package installation settings
- Registry configuration for dependencies

## Development Tools

### TypeScript Configuration

The `tsconfig.json` file enforces type checking and configures path aliases for cleaner imports.

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
- Safety rules enabled

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
      include: ['src/**'], // Include the `src` directory
      exclude: [
        'src/config/**', // Ignore ESLint & config files
        'src/__tests__/**', // Ignore test files (tests don't need coverage)
      ],
    },
    environment: 'node', // Simulates Node.js
    globals: true, // Allows global `expect`
    alias: {
      '@/': new URL('./src/', import.meta.url).pathname, // Fix path aliasing
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
name: Profile README Weather Update

# Trigger mechanisms for workflow execution
on:
  schedule:
    # Runs at 17 minutes past every 6th hour (avoiding peak traffic times)
    - cron: '17 */6 * * *'
  workflow_dispatch: # Allows manual triggering with parameters
    inputs:
      location:
        description: 'Weather location to display'
        required: false
        default: 'Dhaka'
        type: string
      force_update:
        description: 'Force README update even if weather unchanged'
        required: false
        default: false
        type: boolean
      debug:
        description: 'Enable verbose debug logging'
        required: false
        default: false
        type: boolean

# Workflow environment variables
env:
  WORKFLOW_VERSION: '2.5.0'
  LAST_UPDATED: '2025-03-08'
  BUN_VERSION: 'latest'
  WEATHER_LOCATION: ${{ github.event.inputs.location || 'Dhaka' }}
  FORCE_UPDATE: ${{ github.event.inputs.force_update == 'true' }}
  DEBUG_MODE: ${{ github.event.inputs.debug == 'true' }}
  TIMEZONE: 'Asia/Dhaka'

jobs:
  preflight:
    name: Preflight Checks
    runs-on: ubuntu-latest
    # Job steps...

  update-weather:
    name: Update Profile README Weather
    needs: preflight
    runs-on: ubuntu-latest
    # Job steps...
```

**Key Features:**

- **Automated Scheduling**: Runs every 6 hours via cron expression
- **Manual Trigger**: Can be triggered manually with `workflow_dispatch`
- **Customizable Parameters**:
  - Weather location
  - Force update option
  - Debug logging toggle
- **Two-job structure**:
  1. Preflight checks to verify environment and API availability
  2. Main update job for fetching weather and updating README

**Workflow Process:**

1. Check runner environment and verify secrets
2. Test OpenWeather API health
3. Checkout repositories (weather script and personal profile)
4. Set up Bun runtime environment
5. Install and cache dependencies
6. Fetch weather data with retry logic
7. Update README with new weather information
8. Commit and push changes if README was modified
9. Generate execution summary report

**Security Features:**

- Minimal permission scoping
- Git commit signing
- Secret validation

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
3. **Change Detection**: Only make changes when necessary
4. **Error Handling**: Implement backup and recovery mechanisms

---

<div align="center">
  <p>
    <strong>Profile Weather View</strong> | Configuration Documentation
  </p>
  <p>
    <small>For questions about configuration, please open an issue in the repository.</small>
  </p>
</div>
