<div align="center">
  <img src="../../image/test_cover.png" alt="Profile Weather View - Automated weather updates for GitHub profile README" width="900">
</div>

# Test Infrastructure

This directory contains the complete test infrastructure for the weather update project using Bun's built-in test runner.

## Directory Structure

```text
src/tests/
├── README.md                           # This file
├── setup.ts                            # Global test setup and configuration
├── unit/                               # Unit tests
│   ├── basic.test.ts                   # Infrastructure and helper tests
│   ├── services/
│   │   ├── fetch-weather.test.ts       # Open-Meteo API tests
│   │   ├── update-readme.test.ts       # README update logic tests
│   │   └── wmo-mapper.test.ts          # WMO code to Meteocons mapping tests
│   └── utils/
│       └── preload.test.ts             # Environment validation tests
└── utils/
    └── weather-test-helpers.ts         # Shared test utilities
```

## Quick Start

```bash
# Run all tests
bun test

# Run tests with coverage
bun test --coverage

# Run specific test file
bun test src/tests/unit/services/fetch-weather.test.ts

# Run tests in watch mode
bun test --watch

# Filter by test name
bun test -t "should fetch and transform"
```

## Configuration

### bunfig.toml

Test configuration in `bunfig.toml`:

```toml
[test]
root = "src/tests"
preload = ["./src/tests/setup.ts"]
coverage = true
coverageSkipTestFiles = true
coverageThreshold = { line = 0.9, function = 0.9, statement = 0.9 }
timeout = 15000
```

### Global Setup (src/tests/setup.ts)

- Environment variable defaults for test isolation
- Test utilities and helper functions
- Global hooks (beforeAll, afterAll)
- Performance monitoring utilities
- Temp file management

## Test Utilities

### Weather Test Helpers (src/tests/utils/weather-test-helpers.ts)

#### Creating Test Data

```typescript
import {
  createTestWeatherPayload,
  createMockApiResponse,
} from "@/tests/utils/weather-test-helpers";

// Create basic weather payload
const weather = createTestWeatherPayload();

// Create with overrides
const customWeather = createTestWeatherPayload({
  description: "Rain",
  temperatureC: 15,
});

// Create mock Open-Meteo API response
const apiResponse = createMockApiResponse();
```

#### README Testing

```typescript
import {
  createTestReadmeContent,
  validateReadmeWeatherSection,
} from "@/tests/utils/weather-test-helpers";

// Create test README content
const readmeContent = createTestReadmeContent(weatherData);

// Validate weather section exists
const hasWeatherSection = validateReadmeWeatherSection(readmeContent);
```

#### Mocking Fetch

```typescript
import { mock } from "bun:test";

// Mock global fetch
global.fetch = mock(() =>
  Promise.resolve(Response.json(mockApiResponse))
) as unknown as typeof fetch;
```

#### Performance Testing

```typescript
import { performanceTestUtils } from "@/tests/utils/weather-test-helpers";

// Measure execution time
const { result, duration } = await performanceTestUtils.measureExecutionTime(
  async () => {
    return await someAsyncFunction();
  }
);

// Check against threshold
const checker = performanceTestUtils.createThresholdChecker(2000);
expect(checker.check(duration)).toBe(true);
```

## Writing Tests

### Basic Structure

```typescript
import { describe, expect, test } from "bun:test";

describe("fetchWeatherData", () => {
  test("should fetch and transform weather data successfully", async () => {
    // Arrange
    const mockResponse = createMockApiResponse();
    global.fetch = mock(() =>
      Promise.resolve(Response.json(mockResponse))
    ) as unknown as typeof fetch;

    // Act
    const result = await fetchWeatherData();

    // Assert
    expect(result.temperatureC).toBe(25);
    expect(result.icon).toBe("clear-day");
  });
});
```

### Test Organization

| Directory | Purpose |
| --------- | ------- |
| `unit/services/` | Service module tests (fetch-weather, update-readme, wmo-mapper) |
| `unit/utils/` | Utility module tests (preload) |
| `unit/basic.test.ts` | Infrastructure and helper validation |
| `utils/` | Shared test utilities and factories |

### Naming Conventions

- Files: `kebab-case.test.ts`
- Describes: Module or function name
- Tests: `should <expected behavior>`

## Coverage

Configuration:

- 100% coverage target on all source files
- Test files excluded from coverage calculations
- LCOV output at `coverage/lcov.info`

Current coverage:

| File | Functions | Lines |
| ---- | --------- | ----- |
| fetch-weather.ts | 100% | 100% |
| update-readme.ts | 100% | 100% |
| wmo-mapper.ts | 100% | 100% |
| preload.ts | 100% | 100% |

## Best Practices

### Use Test Utilities

```typescript
// Preferred: use factories
const weather = createTestWeatherPayload();

// Avoid: manual object creation
const weather = { description: "Clear", temperatureC: 25 };
```

### Mock External Dependencies

```typescript
// Mock fetch for API tests
const originalFetch = global.fetch;

beforeEach(() => {
  global.fetch = mock(() =>
    Promise.resolve(Response.json(mockData))
  ) as unknown as typeof fetch;
});

afterAll(() => {
  global.fetch = originalFetch;
});
```

### Test Both Paths

```typescript
// Success path
test("should return weather data on success", async () => {
  // ...
});

// Error path
test("should throw on API failure", async () => {
  global.fetch = mock(() =>
    Promise.resolve(new Response("Not Found", { status: 404 }))
  ) as unknown as typeof fetch;

  await expect(fetchWeatherData()).rejects.toThrow();
});
```

### Use Type Assertions Correctly

```typescript
// For mock type casting
global.fetch = mock(() =>
  Promise.resolve(Response.json(data))
) as unknown as typeof fetch;

// For branded types in assertions
expect(result.temperatureC).toBe(25 as TemperatureCelsius);
```

## Scripts

```bash
bun test                     # Run all tests
bun test --watch             # Watch mode
bun test --coverage          # Generate coverage report
bun test -t "pattern"        # Filter by test name
bun test src/tests/unit/     # Run specific directory
```

## Debugging

```bash
# Verbose output
bun test --reporter=verbose

# Run single test file
bun test src/tests/unit/services/fetch-weather.test.ts

# Filter to specific test
bun test -t "should handle API failure"
```

## References

- [Bun Test Documentation](https://bun.sh/docs/cli/test)
- [Bun Test Configuration](https://bun.sh/docs/runtime/bunfig)
