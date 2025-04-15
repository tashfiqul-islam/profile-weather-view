<div style="text-align: center;">
  <h1>Configuration</h1>
</div>

<br>

<div style="text-align: center; display: flex; justify-content: center; gap: 5px; flex-wrap: wrap;">
  <Badge type="info" text="Configuration - Standard"></Badge>
  <Badge type="info" text="TypeScript - v5.8.2"></Badge>
  <Badge type="info" text="ESLint - v9"></Badge>
  <Badge type="warning" text="Bun - Latest"></Badge>
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

Environment variables are loaded using the `dotenv` package in `src/weather-update/utils/preload.ts`.
This module is automatically executed at application startup through the Bun preload mechanism configured in `bunfig.toml`.

### Validation

The application performs validation of required environment variables:

```typescript
// From src/weather-update/plugins/preload.ts
export function ensureEnvironmentVariables(): void {
  const apiKey = Bun.env['OPEN_WEATHER_KEY']?.trim();

  if (!apiKey) {
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

The `bunfig.toml` file configures the Bun runtime environment with settings for the application.

```toml
# 🚀 Bun Configuration for profile-weather-view

# ================================
# Core Runtime Configuration
# ================================

# Performance optimization
smol = false

# Runtime debugging and observability
logLevel = "warn"
errorStackTraces = true
defaultRuntimeSafety = true

# Preload critical modules for fast startup
preload = [
    "./src/weather-update/utils/preload.ts",
    "./src/weather-update/services/fetchWeather.ts"
]

# ================================
# Runtime Execution
# ================================

[run]
# Node.js compatibility layer
bun = true
node_modules = true

# Enable runtime hardening
allowUserCode = true
experimentalLifecycleHooks = true
experimentalWorkerThreads = true

# Resource limits for production safety
maxConcurrency = 8
readableByteLimit = "512MB"
maxEventLoopUtilization = 0.85

# ================================
# File Loading & Handling
# ================================

[loader]
# TypeScript and modern formats
".ts" = "ts"
".tsx" = "tsx"
".mts" = "ts"
".json" = "json"
".toml" = "toml"

# ================================
# Package Management
# ================================

[install]
# Dependency handling configuration
optional = true
dev = true
peer = true
production = false
exact = false
auto = "fallback"
frozenLockfile = true
saveTextLockfile = false
esm = true

# Registry sources
registry = "https://registry.npmjs.org"
enableGlobalCache = true

# Security settings
verifySignatures = true
allowInsecureDependencies = false
integrityCheck = true

# ================================
# Web Server Configuration
# ================================

[server]
# Development server settings
port = 3000
hostname = "localhost"
development = true
staticDir = "./public"
cors = true
certificateMode = "auto"

# Compression and response optimization
compression = true
http2 = true
etag = true
staticCompression = true
maxRequestBodySize = "50MB"

# ================================
# Testing Configuration
# ================================

[test]
# Core Testing setup
coverage = true
includeSource = true
environment = "node"
watchMode = true
```

**Key Features:**

- Automatic preloading of environment variables and core services
- TypeScript loader configuration
- Comprehensive package installation settings
- Web server and testing configuration
- Resource limits for production safety

## Development Tools

### TypeScript Configuration

The `tsconfig.json` file enforces type checking and configures path aliases for cleaner imports.

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ESNext", "DOM", "WebWorker"],

    "baseUrl": "./",
    "rootDir": "src",
    "outDir": "dist",
    "paths": {
      "@/*": ["src/*"],
      "@/docs/*": ["src/docs/*"],
      "@/tests/*": ["src/tests/*"],
      "@/weather-updates/*": ["src/weather-updates/*"]
    },
    "types": ["bun", "node"],
    "typeRoots": ["./node_modules/@types", "./src/types"],
    "resolveJsonModule": true,

    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "useUnknownInCatchVariables": true,
    "alwaysStrict": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitOverride": true,
    "allowUnusedLabels": false,
    "allowUnreachableCode": false,

    "noPropertyAccessFromIndexSignature": true,
    "noErrorTruncation": true,

    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "preserveSymlinks": false,
    "verbatimModuleSyntax": true,

    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,

    "noEmit": true,
    "sourceMap": true,
    "declaration": true,
    "declarationMap": true,
    "importHelpers": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "incremental": true,

    "composite": true,
    "disableSourceOfProjectReferenceRedirect": true,

    "useDefineForClassFields": true
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.mts", "src/**/*.d.ts"],
  "exclude": ["node_modules", "dist", "tmp", "coverage", ".git", ".github"],
  "watchOptions": {
    "watchFile": "useFsEvents",
    "watchDirectory": "useFsEvents",
    "fallbackPolling": "dynamicPriority",
    "synchronousWatchDirectory": true,
    "excludeDirectories": ["**/node_modules", "dist"]
  },
  "ts-node": {
    "transpileOnly": true,
    "esm": true
  }
}
```

**Key Features:**

- ESNext target for modern JavaScript features
- Strict type checking enabled
- Path aliases for cleaner imports (`@/*`, etc.)
- Comprehensive safety rules enabled

The project also includes `tsconfig.test.json` which extends the base configuration with test-specific settings.

### Code Quality Tools

#### ESLint Configuration (eslint.config.mjs)

The ESLint configuration uses a modular approach with specialized rule sets:

```javascript
import tseslint from 'typescript-eslint';
import eslint from '@eslint/js';
import globals from 'globals';
import prettier from 'eslint-plugin-prettier';
import perfectionistPlugin from 'eslint-plugin-perfectionist';
import stylisticPlugin from '@stylistic/eslint-plugin';
import sonarjsPlugin from 'eslint-plugin-sonarjs';
import unicornPlugin from 'eslint-plugin-unicorn';
import securityPlugin from 'eslint-plugin-security';
import eslintCommentsPlugin from 'eslint-plugin-eslint-comments';

// ✅ Importing modular rule configurations
import { getParserProjects } from './src/config/parser.config.mjs';
import { getPrettierRules } from './src/config/eslint-prettier.config.mjs';
import { getSortRules } from './src/config/sort.config.mjs';
import { getStylisticRules } from './src/config/stylistic.config.mjs';
import { getUnicornRules } from './src/config/unicorn.config.mjs';
import { getSecurityRules } from './src/config/security.config.mjs';
import { getCommentsRules } from './src/config/comments.config.mjs';

// ✅ TypeScript parser options
const tsParserOptions = {
  projectService: true,
  tsconfigRootDir: process.cwd(),
  project: getParserProjects(),
};

// ✅ ESLint Configuration
export default tseslint.config(
  { files: ['**/*.{ts,js}'] },
  eslint.configs.recommended,

  // ✅ TypeScript Rules
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: tsParserOptions,
      globals: {
        ...globals.node,
      },
    },
  },

  // ✅ SonarJS (Detects Code Smells)
  {
    plugins: { sonarjs: sonarjsPlugin },
    rules: sonarjsPlugin.configs.recommended.rules,
  },

  // ✅ Unicorn (Modern JS Best Practices)
  {
    plugins: { unicorn: unicornPlugin },
    rules: getUnicornRules(),
  },

  // ✅ Security Rules
  {
    plugins: { security: securityPlugin },
    rules: getSecurityRules(),
  },

  // ✅ Perfectionist (Sort and Organize Code)
  {
    plugins: { perfectionist: perfectionistPlugin },
    rules: getSortRules(),
    settings: {
      perfectionist: {
        type: 'alphabetical',
        order: 'asc',
        partitionByComment: true,
      },
    },
  },

  // ✅ Stylistic Rules
  {
    plugins: { '@stylistic': stylisticPlugin },
    rules: getStylisticRules(),
  },

  // ✅ Prettier Integration
  {
    plugins: { prettier },
    rules: getPrettierRules(),
  },

  // ✅ ESLint Comments Rules
  {
    plugins: { 'eslint-comments': eslintCommentsPlugin },
    rules: getCommentsRules(),
  },

  // Additional configurations...
);
```

**Configured Plugins:**

- `typescript-eslint`: TypeScript-specific linting
- `eslint-plugin-sonarjs`: Detects code smells
- `eslint-plugin-unicorn`: Modern JavaScript best practices
- `eslint-plugin-security`: Security vulnerability detection
- `eslint-plugin-perfectionist`: Code organization and sorting
- `@stylistic/eslint-plugin`: Consistent code style
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

#### Commitlint Configuration (commitlint.config.mjs)

Enforces conventional commit messages for better repository history.

```javascript
/**
 * Commitlint Configuration
 * Enforces conventional commit message format for better changelog generation
 */

export default {
  extends: ['@commitlint/config-conventional'],

  // Custom rules for commit messages
  rules: {
    // Enforce body line length
    'body-max-line-length': [2, 'always', 100],

    // Ensure the subject is not empty and follows case convention
    'subject-case': [2, 'never', ['start-case', 'pascal-case', 'upper-case']],

    // Enforce scope naming conventions
    'scope-enum': [
      2,
      'always',
      [
        'docs', // Documentation changes
        'config', // Configuration changes
        'weather', // Weather-related functionality
        'ui', // User interface
        'test', // Testing infrastructure
        'deps', // Dependencies
        'ci', // Continuous integration
      ],
    ],
  },

  // Help message configuration
  helpUrl:
    'https://github.com/conventional-changelog/commitlint/#what-is-commitlint',

  // Custom prompt settings for interactive commits
  prompt: {
    settings: {
      enableMultipleScopes: true,
      scopeEnumSeparator: ',',
    },
    messages: {
      skip: ':skip',
      max: 'upper %d chars',
      min: '%d chars at least',
      emptyWarning: 'can not be empty',
      upperLimitWarning: 'over limit',
      lowerLimitWarning: 'below limit',
    },
  },
};
```

### Testing Configuration

#### Vitest Configuration (vitest.config.ts)

```typescript
/**
 * Vitest Configuration
 *
 * Testing configuration optimized for reliability, performance,
 * and developer experience with Bun runtime.
 */

import { defineConfig, coverageConfigDefaults } from 'vitest/config';
import { resolve } from 'path';
import type { ViteUserConfig } from 'vitest/config';

// Performance settings
const WORKER_THREADS = 4;
const TIMEOUT = 10000;
const POOL_OPTIONS = {
  threads: {
    singleThread: false,
    isolate: true,
    maxThreads: WORKER_THREADS,
  },
  forks: {
    isolate: true,
    maxForks: WORKER_THREADS,
  },
};

// Coverage requirements
const COVERAGE_THRESHOLDS = {
  statements: 100,
  branches: 100,
  functions: 100,
  lines: 100,
  perFile: true,
};

// Test file patterns
const TEST_PATHS = {
  include: ['src/__tests__/**/*.test.ts'],
  exclude: [
    '**/node_modules/**',
    '**/dist/**',
    '**/coverage/**',
    '**/.{git,cache,temp}/**',
    '**/*.config.*',
    '**/fixtures/**',
  ],
  benchmarks: ['src/__tests__/**/*.bench.ts'],
  setupFiles: ['./src/__tests__/setup.ts'],
  coverage: ['src/weather-update/**/*.ts'],
};

// Import aliases
const PATH_ALIASES = {
  '@': resolve(process.cwd(), 'src'),
  '@/tests': resolve(process.cwd(), 'src/__tests__'),
  '@/weather-update': resolve(process.cwd(), 'src/weather-update'),
  '@/docs': resolve(process.cwd(), 'src/docs'),
};

export default defineConfig({
  // Test configuration...
  test: {
    // Environment settings
    globals: true,
    environment: 'node',

    // File selection
    include: TEST_PATHS.include,
    exclude: TEST_PATHS.exclude,

    // Coverage configuration
    coverage: {
      provider: 'v8',
      enabled: true,
      clean: true,
      cleanOnRerun: true,
      reportsDirectory: './coverage',
      include: TEST_PATHS.coverage,
      exclude: [
        ...coverageConfigDefaults.exclude,
        '**/*.test.ts',
        '**/*.d.ts',
        '**/*.config.ts',
      ],
      reporter: ['text', 'html', 'lcov'],
      all: true,
      skipFull: false,
      extension: ['.ts'],
      reportOnFailure: true,
      thresholds: COVERAGE_THRESHOLDS,
    },

    // Additional configuration...
  },

  // Module resolution
  resolve: {
    alias: PATH_ALIASES,
  },
} as ViteUserConfig);
```

**Key Features:**

- Coverage reporting with 100% threshold requirements
- Node.js testing environment
- Path alias support for cleaner imports in tests
- Benchmark configuration for performance testing

## CI/CD Configuration

### GitHub Actions Workflow

The `.github/workflows/profile-weather-update.yml` file configures the automated workflow
for updating the README with weather data.

```yaml
name: 'Profile Weather Update'

# ============================================================
# 🚀 Optimized triggers for reliability and performance
# ============================================================
on:
  schedule:
    # Strategic times that capture meaningful weather changes while conserving resources
    - cron: '23 5,13,21 * * *' # 3 times daily: morning (5:23), afternoon (13:23), evening (21:23)

  workflow_dispatch:
    inputs:
      debug:
        description: 'Enable debug mode'
        required: false
        default: 'false'
        type: choice
        options:
          - 'true'
          - 'false'
      retry_strategy:
        description: 'API failure retry strategy'
        type: choice
        options:
          - exponential
          - linear
          - none
        default: 'exponential'
      skip_tests:
        description: 'Skip test execution'
        type: boolean
        default: false
      force_update:
        description: 'Force README update regardless of changes'
        type: boolean
        default: false

  # Self-healing mechanism (Triggers on failure)
  workflow_run:
    workflows: ['Profile Weather Update']
    types: [completed]
    branches: [master]

# ============================================================
# 🚀 Prevent redundant executions (Ensures single execution)
# ============================================================
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

# ============================================================
# 🔒 Explicit permissions (Principle of least privilege)
# ============================================================
permissions:
  contents: write # For repository updates
  id-token: write # For OIDC token (keyless signing)
  actions: read # For workflow status checks

# ============================================================
# 🌍 Global environment variables
# ============================================================
env:
  BUN_VERSION: 'latest'
  CACHE_KEY_PREFIX: 'v3-profile-weather'
  LOG_LEVEL: ${{ github.event.inputs.debug == 'true' && 'debug' || 'warn' }}
  TIMEZONE: 'Asia/Dhaka'
  RETRY_STRATEGY: ${{ github.event.inputs.retry_strategy || 'exponential' }}
  EXECUTION_ID: ${{ github.run_id }}-${{ github.run_attempt }}
  CODE_REPO: 'tashfiqul-islam/profile-weather-view'
  PROFILE_REPO: 'tashfiqul-islam/tashfiqul-islam'
  BUN_RUNTIME_SAFETY: 'true' # Aligns with bunfig.toml defaultRuntimeSafety
  NODE_ENV: 'production'
  FORCE_UPDATE: ${{ github.event.inputs.force_update == true }}
  SKIP_TESTS: ${{ github.event.inputs.skip_tests == true }}

jobs:
  preflight:
    name: '🚀 Preflight Checks'
    runs-on: ubuntu-latest
    timeout-minutes: 2
    # Job steps...

  update-weather:
    name: '🌦️ Update Weather Data'
    needs: preflight
    if: needs.preflight.outputs.env_valid == 'true'
    runs-on: ubuntu-latest
    timeout-minutes: 5
    # Job steps...

  verify:
    name: '✅ Verify & Report'
    needs: [preflight, update-weather]
    if: always() && needs.preflight.result == 'success'
    runs-on: ubuntu-latest
    timeout-minutes: 2
    # Job steps...

  recovery:
    name: '🔄 Recovery Actions'
    needs: [preflight, update-weather, verify]
    if: always() && (needs.update-weather.result == 'failure' || needs.verify.result == 'failure')
    runs-on: ubuntu-latest
    timeout-minutes: 3
    # Job steps...
```

**Key Features:**

- **Automated Scheduling**: Runs three times daily at strategic times
- **Manual Trigger**: Can be triggered manually with customizable parameters:
  - Debug mode
  - Retry strategy for handling failures
  - Test skipping option
  - Force update option
- **Self-healing**: Automatically attempts recovery on failures
- **Four-job structure**:
  1. Preflight checks to verify environment and API availability
  2. Main update job for fetching weather and updating README
  3. Verification to ensure successful execution
  4. Recovery actions for handling failures

**Security Features:**

- Minimal permission scoping (principle of the least privilege)
- Concurrency limiting to prevent simultaneous runs
- Explicit timeout limits for job safety

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

<div style="text-align: center;">
  <p>
    <strong>Profile Weather View</strong> | Configuration Documentation
  </p>
  <p>
    <small>For questions about configuration, please open an issue in the repository.</small>
  </p>
</div>
