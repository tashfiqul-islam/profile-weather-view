<div style="text-align: center;">
  <h1>Testing</h1>
</div>

<br>

<div style="text-align: center; display: flex; justify-content: center; gap: 5px; flex-wrap: wrap;">
  <Badge type="success" text="Testing - Vitest"></Badge>
  <Badge type="danger" text="Coverage: - V8"></Badge>
  <Badge type="warning" text="CI Integration - Husky"></Badge>
  <Badge type="info" text="TypeScript - 5.8.2"></Badge>
</div>

## Table of Contents

- [Overview](#overview)
- [Testing Framework](#testing-framework)
- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
- [Unit Testing](#unit-testing)
- [Benchmarking](#benchmarking)
- [Test Coverage](#test-coverage)
- [Mocking Strategies](#mocking-strategies)
- [CI Integration](#ci-integration)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

Testing is a core component of Profile Weather View's development workflow, ensuring reliability and functionality
across all aspects of the application.
The project uses a comprehensive testing strategy with 100% coverage goals
and automated validation through continuous integration.

## Testing Framework

The project uses [Vitest](https://vitest.dev/) for testing, a Vite-native test framework that's optimized for
modern JavaScript applications.
Vitest offers several advantages:

- **Speed**: Built on top of Vite for extremely fast test execution
- **ESM Support**: Native support for ECMAScript Modules
- **TypeScript Integration**: First-class TypeScript support
- **Watch Mode**: Fast hot module replacement during development
- **Coverage Reporting**: Built-in coverage analysis
- **Benchmark Testing**: Built-in support for performance benchmarking

Configuration is defined in `vitest.config.ts`:

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
  // Test runner configuration
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
      thresholds: COVERAGE_THRESHOLDS,
      // Additional coverage settings...
    },

    // Benchmark configuration
    benchmark: {
      include: TEST_PATHS.benchmarks,
      exclude: TEST_PATHS.exclude,
      outputFile: './benchmark-results.json',
    },

    // Additional configuration...
  },
  // Additional configuration...
} as ViteUserConfig);
```

## Test Structure

Tests follow a consistent organization pattern, mirroring the source code structure:

```
src/__tests__/
├── setup.ts                              # Test setup & configuration
├── benchmarks/                           # Performance benchmark tests
│   ├── services/
│   │   ├── fetchWeather.benchmark.ts     # Weather service benchmarks
│   │   └── updateReadme.benchmark.ts     # README service benchmarks
│   ├── utils/
│   │   └── preload.benchmark.ts          # Environment utility benchmarks
│   └── index.benchmark.ts                # Main application benchmarks
├── unit/                                 # Unit test directory
│   ├── services/
│   │   ├── fetchWeather.test.ts          # Weather service tests
│   │   └── updateReadme.test.ts          # README service tests
│   ├── utils/
│   │   └── preload.test.ts               # Environment utility tests
│   └── index.test.ts                     # Main application tests
```

The test structure mirrors the application's architecture to maintain clarity and traceability:

| Component                 | Unit Test                            | Benchmark                                       |
| ------------------------- | ------------------------------------ | ----------------------------------------------- |
| **Application Core**      | `unit/index.test.ts`                 | `benchmarks/index.benchmark.ts`                 |
| **Weather Service**       | `unit/services/fetchWeather.test.ts` | `benchmarks/services/fetchWeather.benchmark.ts` |
| **README Service**        | `unit/services/updateReadme.test.ts` | `benchmarks/services/updateReadme.benchmark.ts` |
| **Environment Utilities** | `unit/utils/preload.test.ts`         | `benchmarks/utils/preload.benchmark.ts`         |

## Running Tests

The project provides multiple commands for running tests defined in `package.json`:

```json
{
  "scripts": {
    "test": "bunx vitest",
    "test:staged": "bunx vitest --run",
    "test:watch": "bunx vitest --watch",
    "test:coverage": "bunx vitest --coverage",
    "check-all": "bunx vitest --run && bun run tsc --noEmit && bun format && bun lint"
  }
}
```

### Command Usage

| Command             | Description                 | Usage                                  |
| ------------------- | --------------------------- | -------------------------------------- |
| `bun test`          | Run all tests               | Used for quick validation of all tests |
| `bun test:staged`   | Run tests on staged changes | Used by pre-commit hooks               |
| `bun test:watch`    | Run tests in watch mode     | Best for active development            |
| `bun test:coverage` | Run tests with coverage     | For quality assurance                  |
| `bun run check-all` | Run all checks              | Complete validation suite              |

### Command Examples

```bash
# Run all tests
bun test

# Run tests for a specific file
bun test src/__tests__/unit/services/fetchWeather.test.ts

# Run tests in watch mode
bun test:watch

# Generate coverage report
bun test:coverage
```

## Unit Testing

Unit tests focus on testing individual components in isolation to verify their behavior.
The project follows a consistent pattern for unit tests:

### Test Setup

All tests use the global setup file (`setup.ts`) that provides common functionality:

```typescript
import { vi, afterAll, beforeAll, afterEach } from 'vitest';

// Mock global objects if needed
beforeAll(() => {
  console.warn('🚀 Setting up global test environment...');

  // Example: Mock a Date
  vi.useFakeTimers();
});

// Reset mocks after each test
afterEach(() => {
  vi.restoreAllMocks();
});

// Cleanup after all tests
afterAll(() => {
  console.warn('✅ Global test environment cleanup complete!');
  vi.clearAllTimers();
});
```

### Test Example

Here's an example from `fetchWeather.test.ts` that demonstrates the testing approach:

```typescript
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';

import {
  fetchWeatherData,
  convertToDhakaTime,
} from '@/weather-update/services/fetchWeather';

describe('fetchWeatherData()', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal('Bun', { env: { OPEN_WEATHER_KEY: 'test-api-key' } });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function mockFetchResponse(response: object, ok = true) {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          json: vi.fn().mockResolvedValue(response),
          ok,
        }),
      ),
    );
  }

  it('should correctly convert UTC timestamp to Dhaka time', () => {
    const dhakaTime = convertToDhakaTime(1710000000);
    expect(dhakaTime).toMatch(/\d{2}:\d{2}:\d{2}/);
  });

  it('should fetch weather data successfully', async () => {
    mockFetchResponse({
      current: {
        humidity: 60,
        sunrise: 1710000000,
        sunset: 1710050000,
        temp: 30,
        weather: [{ icon: '03d', main: 'Cloudy' }],
      },
    });

    const weatherData = await fetchWeatherData();
    const expectedSunrise = convertToDhakaTime(1710000000);
    const expectedSunset = convertToDhakaTime(1710050000);

    expect(weatherData).toBe(
      `Cloudy|30|${expectedSunrise}|${expectedSunset}|60|03d`,
    );
  });

  // Additional test cases...
});
```

## Benchmarking

The project includes performance benchmarks to monitor execution speed and detect performance regressions.

### TypeScript Configuration

To properly use benchmarks with TypeScript, ensure your benchmark files are included in your TypeScript configuration.
Add the benchmark patterns to your `tsconfig.json` or `tsconfig.test.json`:

```json
{
  "include": [
    "src/__tests__/**/*.ts",
    "src/__tests__/**/*.test.ts",
    "src/__tests__/**/*.spec.ts",
    "src/__tests__/**/*.bench.ts"
  ]
}
```

### Benchmark Example

Here's an example from `index.benchmark.ts`:

```typescript
import { bench, describe } from 'vitest';

import { main } from '@/weather-update';

// Benchmark performance of the entire weather update process
describe('Full Weather Update Process Performance', () => {
  bench(
    'Process and update weather data',
    async () => {
      await main();
    },
    { time: 1000 }, // Runs for 1 second to track execution speed
  );
});
```

Each benchmark runs for a fixed time period (1000 ms) to provide consistent performance metrics.

### Running Benchmarks

Benchmarks can be run with:

```bash
# Run benchmarks
bun test src/__tests__/benchmarks/**/*.benchmark.ts
```

Benchmark results are saved to `./benchmark-results.json` for analysis and comparison.

## Test Coverage

Code coverage is a key metric for ensuring test quality.
The project uses Vitest's built-in
coverage functionality with the V8 coverage provider.

### Coverage Goals

The project maintains 100% coverage across all metrics:

- **Line Coverage**: 100% required
- **Branch Coverage**: 100% required
- **Function Coverage**: 100% required
- **Statement Coverage**: 100% required

### Coverage Report

The project consistently achieves 100% coverage across all metrics:

```
 % Coverage report from v8
-------------------------|---------|----------|---------|---------|-------------------
File                     | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-------------------------|---------|----------|---------|---------|-------------------
All files                |     100 |      100 |     100 |     100 |
 weather-update          |     100 |      100 |     100 |     100 |
  index.ts               |     100 |      100 |     100 |     100 |
 weather-update/services |     100 |      100 |     100 |     100 |
  fetchWeather.ts        |     100 |      100 |     100 |     100 |
  updateReadme.ts        |     100 |      100 |     100 |     100 |
 weather-update/utils    |     100 |      100 |     100 |     100 |
  preload.ts             |     100 |      100 |     100 |     100 |
-------------------------|---------|----------|---------|---------|-------------------
```

Coverage reports are generated in three formats:

1. **Text**: Console output for quick reference
2. **HTML**: Interactive report for detailed analysis
3. **LCOV**: Standard format for CI/CD integration

## Mocking Strategies

The project uses various mocking techniques to isolate units under test and simulate dependencies:

### API Mocking

External API calls are mocked using Vitest's `vi.stubGlobal`:

```typescript
vi.stubGlobal(
  'fetch',
  vi.fn(() =>
    Promise.resolve({
      json: vi.fn().mockResolvedValue({
        current: {
          humidity: 60,
          sunrise: 1710000000,
          sunset: 1710050000,
          temp: 30,
          weather: [{ icon: '03d', main: 'Cloudy' }],
        },
      }),
      ok: true,
    }),
  ),
);
```

### Bun Runtime Mocking

Bun-specific functionality is mocked to simulate the runtime environment:

```typescript
vi.stubGlobal('Bun', {
  env: { OPEN_WEATHER_KEY: 'test-api-key' },
  file: vi.fn(() => ({
    exists: vi.fn(() => Promise.resolve(true)),
    text: vi.fn(() => Promise.resolve(mockReadmeContent)),
  })),
  write: vi.fn(() => Promise.resolve()),
});
```

### Console Output Mocking

Console output is mocked to prevent pollution of test logs and verify logging behavior:

```typescript
const mockConsoleWarn = vi
  .spyOn(console, 'warn')
  .mockImplementation(() => undefined);
const mockConsoleError = vi
  .spyOn(console, 'error')
  .mockImplementation(() => undefined);
```

### Process Mocking

For testing process-related functionality:

```typescript
let mockProcessExit = vi
  .spyOn(process, 'exit')
  .mockImplementation((code?: number | undefined) => {
    throw new Error(`process.exit(${code})`);
  });
```

## CI Integration

Tests are integrated into the development workflow through:

### Pre-commit Hooks

The project uses Husky to run tests before each commit, ensuring code quality:

```bash
#!/usr/bin/env sh

# Pre-commit hook for profile-weather-view
# Validates staged files before allowing commit

# Begin validation stages
echo "${BLUE}Starting validation pipeline${NC}"

# 1. Run Prettier formatting
echo "${BLUE}🖌️  Checking code formatting...${NC}"
bun run format

# 2. Run ESLint checks
echo "${BLUE}🧹 Running linter checks...${NC}"
bun run lint

# 3. Run TypeScript type checking
echo "${BLUE}📘 Running TypeScript type checking...${NC}"
bun run type-check

# 4. Run associated tests (only affected tests if possible)
echo "${BLUE}🧪 Running tests for affected areas...${NC}"
bun run test:staged
```

### GitHub Actions

Tests are also run in the GitHub Actions workflow for pull requests and main branch updates:

```yaml
- name: '🧪 Run Tests'
  if: env.SKIP_TESTS != 'true'
  working-directory: weather-code
  run: |
    echo "::group::Test Execution"
    bun run test
    echo "::endgroup::"
  env:
    # Mock environment variables for tests
    OPEN_WEATHER_KEY: 'mock-api-key-for-tests'
    CI: 'true'
```

## Best Practices

The project follows these testing best practices:

### Test Structure

- **Arrange, Act, Assert** pattern for clear test organization
- **Small, focused tests** that test one thing at a time
- **Descriptive test names** that explain the expected behavior

### Test Quality

- **Isolation**: Tests don't depend on each other
- **Predictability**: Tests produce the same results consistently
- **Speed**: Tests run quickly to support rapid development

### Test Coverage

- **Happy path testing**: Verify standard operation
- **Error handling testing**: Verify graceful failure
- **Edge case testing**: Verify behavior at boundary conditions

## Troubleshooting

### Common Test Issues

| Issue                              | Solution                                                                  |
| ---------------------------------- | ------------------------------------------------------------------------- |
| **Tests fail with API key errors** | Ensure Bun.env['OPEN_WEATHER_KEY'] is properly mocked                     |
| **Mocks not working correctly**    | Verify vi.stubGlobal is used correctly and mocks are restored after tests |
| **Tests timing out**               | Check for unresolved promises or infinite loops                           |
| **File operations failing**        | Ensure Bun.file and Bun.write are properly mocked                         |

### Debugging Tests

For more complex issues, use the debugging capabilities:

```bash
# Run a specific test with more debug information
bun test src/__tests__/unit/services/fetchWeather.test.ts --debug
```

---

<div style="text-align: center;">
  <p>
    <strong>Profile Weather View</strong> | Testing Documentation
  </p>
  <p>
    <small>For questions about testing, please refer to the <a href="https://vitest.dev/guide/">Vitest documentation</a>.</small>
  </p>
</div>
