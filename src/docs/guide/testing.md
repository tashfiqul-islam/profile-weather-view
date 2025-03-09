<div align="center">
  <h1>Testing</h1>
</div>

<br>

<div align="center" style="display: flex; justify-content: center; gap: 5px; flex-wrap: wrap;">
  <img src="https://img.shields.io/badge/Testing-Vitest-6E9F18" alt="Testing Framework">
  <img src="https://img.shields.io/badge/Coverage-V8-4B32C3" alt="Coverage">
  <img src="https://img.shields.io/badge/CI_Integration-Husky-8A4182" alt="CI Integration">
  <img src="https://img.shields.io/badge/TypeScript-5.8.2-3178C6" alt="TypeScript">
</div>

## Table of Contents

- [Overview](#overview)
- [Testing Framework](#testing-framework)
- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
- [Test Coverage](#test-coverage)
- [Mocking Strategies](#mocking-strategies)
- [CI Integration](#ci-integration)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

Testing is a core component of Profile Weather View's development workflow, ensuring reliability and functionality across all aspects of the application. The project employs a comprehensive testing strategy with high coverage goals and automated validation through continuous integration.

## Testing Framework

The project uses [Vitest](https://vitest.dev/) for testing, a Vite-native test framework that's optimized for modern JavaScript applications. Vitest offers several advantages:

- **Speed**: Built on top of Vite for extremely fast test execution
- **ESM Support**: Native support for ECMAScript Modules
- **TypeScript Integration**: First-class TypeScript support
- **Watch Mode**: Fast hot module replacement during development
- **Coverage Reporting**: Built-in coverage analysis
- **Snapshot Testing**: For UI components and string outputs
- **Compatible API**: Similar API to Jest for easy migration

Configuration is defined in `vitest.config.ts`:

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

## Test Structure

Tests follow a consistent organization pattern, mirroring the source code structure:

```
src/
├── __tests__/          # Test directory
│   ├── index.test.ts   # Main application tests
│   ├── services/       # Service tests
│   │   ├── fetchWeather.test.ts
│   │   └── updateReadme.test.ts
│   └── utils/          # Utility tests
│       └── preload.test.ts
```

### Test Coverage Areas

| Component                 | Test File                       | Coverage Focus                                                    |
| ------------------------- | ------------------------------- | ----------------------------------------------------------------- |
| **Application Core**      | `index.test.ts`                 | Application initialization, error handling, service orchestration |
| **Weather Service**       | `services/fetchWeather.test.ts` | API integration, data parsing, error handling, time conversion    |
| **README Service**        | `services/updateReadme.test.ts` | File operations, content replacement, error handling              |
| **Environment Utilities** | `utils/preload.test.ts`         | Environment variable validation, error handling                   |

### Test Case Examples

Here's an example from `fetchWeather.test.ts` that demonstrates the testing approach:

```typescript
describe('fetchWeatherData()', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    process.env = { ...OLD_ENV };

    // Set a default API key for tests that don't explicitly test missing keys
    process.env.OPEN_WEATHER_KEY = 'test-api-key';
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  it('should convert UTC timestamp to Dhaka time correctly', () => {
    const dhakaTime = convertToDhakaTime(1710000000);
    expect(dhakaTime).toMatch(/\d{2}:\d{2}:\d{2}/);
  });

  it('should fetch weather data successfully', async () => {
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

## Running Tests

The project provides multiple commands for running tests:

| Command             | Description                 | Usage                                  |
| ------------------- | --------------------------- | -------------------------------------- |
| `bun test`          | Run all tests               | Used for quick validation of all tests |
| `bun test:watch`    | Run tests in watch mode     | Best for active development            |
| `bun test:coverage` | Run tests with coverage     | For quality assurance                  |
| `bun test:staged`   | Run tests on staged changes | Used by pre-commit hooks               |

### Command Examples

```bash
# Run all tests
bun test

# Run tests for a specific file
bun test src/__tests__/services/fetchWeather.test.ts

# Run tests in watch mode
bun test:watch

# Generate coverage report
bun test:coverage
```

## Test Coverage

Code coverage is a key metric for ensuring test quality. The project uses Vitest's built-in coverage functionality with the V8 coverage provider.

### Coverage Goals

- **Line Coverage**: 80% minimum, 90% target
- **Branch Coverage**: 75% minimum, 85% target
- **Function Coverage**: 85% minimum, 95% target

### Coverage Configuration

Coverage settings in `vitest.config.ts`:

```typescript
coverage: {
  reporter: ['text', 'json', 'html'], // Multiple report formats
  include: ['src/**'],                // Target all source code
  exclude: [                          // Exclude non-testable code
    'src/config/**',
    'src/__tests__/**',
  ],
}
```

### Coverage Reports

Coverage reports are generated in three formats:

1. **Text**: Console output for quick reference
2. **JSON**: Machine-readable data for CI/CD systems
3. **HTML**: Interactive report for detailed analysis

Example coverage output:

```
 % Coverage report from v8
--------------------------|---------|----------|---------|---------|
File                      | % Stmts | % Branch | % Funcs | % Lines |
--------------------------|---------|----------|---------|---------|
All files                 |   94.52 |    89.09 |   96.42 |   94.52 |
 src                      |     100 |      100 |     100 |     100 |
  index.ts                |     100 |      100 |     100 |     100 |
 src/services             |   92.85 |    86.36 |   93.75 |   92.85 |
  fetchWeather.ts         |   90.90 |    83.33 |   88.88 |   90.90 |
  updateReadme.ts         |   95.45 |    90.00 |     100 |   95.45 |
 src/utils                |     100 |      100 |     100 |     100 |
  preload.ts              |     100 |      100 |     100 |     100 |
--------------------------|---------|----------|---------|---------|
```

## Mocking Strategies

The project employs various mocking techniques to isolate units under test and simulate dependencies:

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

### File System Mocking

File operations are mocked to avoid actual file I/O during tests:

```typescript
vi.spyOn(fs, 'readFileSync').mockReturnValue(mockReadmeContent);
const writeFileSyncSpy = vi
  .spyOn(fs, 'writeFileSync')
  .mockImplementation(vi.fn());
```

### Console Output Mocking

Console output is mocked to prevent pollution of test logs:

```typescript
const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(vi.fn());

expect(consoleErrorSpy).toHaveBeenCalledWith(
  '❌ Missing required environment variable: OPEN_WEATHER_KEY',
);
```

### Environment Variables

Environment variables are mocked to test different configurations:

```typescript
const originalEnvironment = { ...process.env };
process.env.OPEN_WEATHER_KEY = 'test-api-key';

// Test code...

process.env = originalEnvironment; // Restore original values
```

## CI Integration

Tests are integrated into the development workflow through:

### Pre-commit Hooks

The project uses Husky to run tests before each commit, ensuring code quality:

```bash
# .husky/pre-commit
#!/bin/sh
bun run format && bun run lint && bun run type-check && bun run test --run
```

### GitHub Actions

Tests are also run in the GitHub Actions CI pipeline for pull requests and pushes to main branches.

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

| Issue                                  | Solution                                           |
| -------------------------------------- | -------------------------------------------------- |
| **Tests don't recognize path aliases** | Check path aliasing in `vitest.config.ts`          |
| **Mocks not working correctly**        | Ensure mocks are restored after each test          |
| **Environment variable errors**        | Verify environment is properly mocked and restored |
| **Tests timing out**                   | Check for unresolved promises or infinite loops    |

### Debugging Tests

For more complex issues, use the debugging capabilities:

```bash
# Run a specific test with more debug information
bun test src/__tests__/services/fetchWeather.test.ts --debug
```

---

<div align="center">
  <p>
    <strong>Profile Weather View</strong> | Testing Documentation
  </p>
  <p>
    <small>For questions about testing, please refer to the <a href="https://vitest.dev/guide/">Vitest documentation</a>.</small>
  </p>
</div>
