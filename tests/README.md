# 🧪 Bun Test Infrastructure

This directory contains the complete test infrastructure for the weather update project using Bun's built-in test runner.

## 📁 Directory Structure

```text
tests/
├── README.md                    # This file
├── setup.ts                     # Global test setup and configuration
├── unit/                        # Unit tests
│   └── basic.test.ts           # Basic infrastructure tests
├── integration/                 # Integration tests (future)
├── fixtures/                    # Test data and mock files
└── utils/                       # Test utilities and helpers
    └── weather-test-helpers.ts  # Weather-specific test utilities
```

## 🚀 Quick Start

```bash
# Run all tests
bun test

# Run tests with coverage
bun test --coverage

# Run specific test file
bun test tests/unit/basic.test.ts

# Run tests in watch mode
bun test --watch

# Run tests with verbose output
bun test --reporter=verbose
```

## ⚙️ Configuration

### bunfig.toml

The test configuration is defined in `bunfig.toml`:

```toml
[test]
root = "tests"                    # Test discovery root
preload = ["./tests/setup.ts"]    # Global setup file
coverage = true                   # Enable coverage by default
coverageSkipTestFiles = true      # Exclude test files from coverage
coverageThreshold = { line = 0.9, function = 0.9, statement = 0.9 }
randomize = true                  # Randomize test order
timeout = 15000                   # 15 second timeout for API calls
```

### Global Setup (tests/setup.ts)

- Environment variable configuration
- Test utilities and helpers
- Global test hooks (beforeAll, afterAll, etc.)
- Performance monitoring utilities

## 🛠️ Test Utilities

### Weather Test Helpers (tests/utils/weather-test-helpers.ts)

#### Weather Data Creation

```typescript
import { createTestWeatherPayload, createMockOpenWeatherResponse } from "./utils/weather-test-helpers";

// Create basic weather payload
const weather = createTestWeatherPayload();

// Create with overrides
const customWeather = createTestWeatherPayload({
  description: "Rain",
  temperatureC: 15,
});

// Create mock API response
const apiResponse = createMockOpenWeatherResponse();
```

#### README Testing

```typescript
import { createTestReadmeContent, validateReadmeWeatherSection } from "./utils/weather-test-helpers";

// Create test README content
const readmeContent = createTestReadmeContent(weatherData);

// Validate weather section exists
const hasWeatherSection = validateReadmeWeatherSection(readmeContent);
```

#### API Mocking

```typescript
import { createMockFetch, errorTestScenarios } from "./utils/weather-test-helpers";

// Create mock fetch function
const mockFetch = createMockFetch([
  () => createMockFetchResponse(200, successData),
  () => createMockFetchResponse(401, errorData),
]);

// Use error scenarios
const errorFetch = createMockFetch([
  errorTestScenarios.invalidApiKey,
  errorTestScenarios.rateLimited,
]);
```

#### Performance Testing

```typescript
import { performanceTestUtils } from "./utils/weather-test-helpers";

// Measure execution time
const { result, duration } = await performanceTestUtils.measureExecutionTime(async () => {
  // Your async operation
  return await someAsyncFunction();
});

// Create threshold checker
const checker = performanceTestUtils.createThresholdChecker(2000); // 2 second threshold
expect(checker.check(duration)).toBe(true);
```

## 📝 Writing Tests

### Basic Test Structure

```typescript
import { describe, expect, test } from "bun:test";

describe("Feature Name", () => {
  test("should do something", () => {
    expect(true).toBe(true);
  });
  
  test("should handle async operations", async () => {
    const result = await someAsyncFunction();
    expect(result).toBeDefined();
  });
});
```

### Test Categories

#### Unit Tests (`tests/unit/`)

- Test individual functions and modules
- Use mocks for external dependencies
- Fast execution, isolated tests

#### Integration Tests (`tests/integration/`)

- Test multiple components working together
- May use real external services (with test keys)
- Slower execution, more realistic scenarios

### Test Naming Convention

- Files: `*.test.ts` or `*.spec.ts`
- Describes: `Feature Name` or `Module Name`
- Tests: `should do something` or `should handle edge case`

## 🎯 Best Practices

### 1. Use Test Utilities

Always use the provided test utilities instead of creating mock data manually:

```typescript
// ✅ Good
const weather = createTestWeatherPayload();

// ❌ Avoid
const weather = { description: "Clear Sky", temperatureC: 25, ... };
```

### 2. Test Performance

Use performance utilities for API and file operations:

```typescript
test("should complete within time limit", async () => {
  const { duration } = await performanceTestUtils.measureExecutionTime(async () => {
    await fetchWeatherData();
  });
  
  expect(duration).toBeLessThan(2000); // 2 seconds
});
```

### 3. Clean Up Resources

Use proper cleanup in tests:

```typescript
afterEach(async () => {
  await testUtils.fs.cleanupTempFiles();
});
```

### 4. Test Error Scenarios

Always test both success and error cases:

```typescript
test("should handle API errors", async () => {
  const mockFetch = createMockFetch([errorTestScenarios.invalidApiKey]);
  // Test error handling
});
```

## 📊 Coverage

The test infrastructure is configured to:

- Generate coverage reports by default
- Exclude test files from coverage calculations
- Enforce 90% coverage thresholds
- Generate HTML and text reports

Coverage reports are generated in the `coverage/` directory.

## 🔧 Available Scripts

```bash
# Basic testing
bun test                    # Run all tests
bun test --watch           # Watch mode
bun test --coverage        # With coverage

# Specific test types
bun test tests/unit        # Unit tests only
bun test tests/integration # Integration tests only

# Advanced options
bun test --concurrent      # Run tests concurrently
bun test --serial         # Run tests sequentially
bun test --timeout 30000  # Custom timeout
bun test --reporter=verbose # Verbose output
```

## 🐛 Debugging

### Debug Mode

```bash
bun test --inspect-brk
```

### Verbose Output

```bash
bun test --reporter=verbose
```

### Specific Test

```bash
bun test -t "should handle API errors"
```

## 📚 Resources

- [Bun Test Documentation](https://bun.sh/docs/cli/test)
- [Bun Test Configuration](https://bun.sh/docs/runtime/bunfig)
- [Test Utilities API](./utils/weather-test-helpers.ts)
- [Global Setup](./setup.ts)
