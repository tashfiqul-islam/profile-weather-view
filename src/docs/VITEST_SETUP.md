# Vitest v4 Setup Documentation

## Overview

This project has been configured with Vitest v4 following the latest documentation and best practices. The setup is optimized for Bun runtime and includes comprehensive testing infrastructure.

## Configuration Files

### `vitest.config.ts`

- **Environment**: Node.js (suitable for utility projects)
- **Globals**: Enabled for Jest-like API
- **Pool**: Threads for better performance
- **Sequence**: List mode for Jest-like hook behavior
- **Coverage**: Temporarily disabled due to Bun compatibility issues

### Key Features

- ✅ Vitest v4.0.3 with latest features
- ✅ TypeScript support with strict configuration
- ✅ Jest-like global APIs (`describe`, `it`, `expect`, etc.)
- ✅ Proper test file discovery patterns
- ✅ CI/CD integration with GitHub Actions
- ✅ Multiple test reporters (default, verbose, UI)
- ⚠️ Coverage reporting (temporarily disabled)

## Test Scripts

### Available Commands

```bash
# Basic test execution
bun run test                    # Run all tests once
bun run test:watch             # Run tests in watch mode
bun run test:ci                # Run tests with verbose reporter (CI mode)

# Advanced testing
bun run test:ui                # Open Vitest UI (interactive)
bun run test:debug             # Run tests with Node.js inspector
bun run test:staged            # Run tests for staged files only

# Coverage (temporarily disabled)
bun run test:coverage          # Shows message about Bun compatibility
```

### CI Integration

- **GitHub Actions**: Updated existing workflow to use new test commands
- **Dedicated Test Workflow**: Created `.github/workflows/test.yml` for comprehensive testing
- **Matrix Testing**: Tests run on multiple Node.js and Bun versions
- **Quality Gates**: Automated quality checks with test results

## Test Structure

```
src/
├── __tests__/
│   ├── setup.ts              # Global test setup
│   └── unit/
│       └── index.test.ts     # Example unit tests
└── weather-update/           # Source code to be tested
    ├── services/
    ├── utils/
    └── index.ts
```

## Test Configuration Details

### File Patterns

- **Include**: `src/**/*.{test,spec}.{js,ts,jsx,tsx}`
- **Exclude**: `node_modules`, `dist`, `coverage`, config files

### Timeouts

- **Test Timeout**: 5 seconds
- **Hook Timeout**: 10 seconds

### Performance

- **Pool**: Threads (better performance than forks)
- **File Parallelism**: Enabled
- **Sequence**: List mode for predictable hook execution

## Coverage Configuration (Future)

When Bun supports V8 coverage or c8 provider works properly, the following configuration is ready:

```typescript
coverage: {
  provider: "@vitest/coverage-c8",
  include: ["src/**/*.{js,ts,jsx,tsx}"],
  exclude: ["**/node_modules/**", "**/dist/**", "**/coverage/**"],
  thresholds: {
    global: { branches: 90, functions: 90, lines: 90, statements: 90 }
  },
  reporter: ["text", "text-summary", "json", "html", "lcov"],
  reportsDirectory: "./coverage"
}
```

## Migration from Previous Setup

### Changes Made

1. **Updated to Vitest v4**: Latest version with new features
2. **Modernized Configuration**: Following v4 best practices
3. **Enhanced Scripts**: More comprehensive test commands
4. **CI Integration**: Updated workflows for better testing
5. **TypeScript Support**: Full type safety in tests

### Breaking Changes Handled

- Removed deprecated `poolOptions` configuration
- Updated coverage configuration for v4 compatibility
- Fixed import paths and API usage

## Best Practices Implemented

### Test Organization

- Clear separation of unit tests in `__tests__/unit/`
- Global setup file for shared test configuration
- Proper file naming conventions

### Performance

- Thread pool for better performance
- File parallelism enabled
- Optimized for Bun runtime

### CI/CD

- Matrix testing across Node.js versions
- Quality gates with test result validation
- Artifact collection for test reports

## Usage Examples

### Basic Test

```typescript
import { describe, it, expect } from 'vitest'

describe('Weather Service', () => {
  it('should fetch weather data', async () => {
    // Test implementation
    expect(true).toBe(true)
  })
})
```

### Async Testing

```typescript
it('should handle async operations', async () => {
  const result = await someAsyncFunction()
  expect(result).toBeDefined()
})
```

### Mocking (when needed)

```typescript
import { vi } from 'vitest'

it('should mock external dependencies', () => {
  const mockFn = vi.fn()
  // Use mockFn in your test
})
```

## Troubleshooting

### Common Issues

1. **Coverage not working**: Currently disabled due to Bun compatibility
2. **Import errors**: Ensure proper TypeScript path mapping
3. **Timeout issues**: Adjust `testTimeout` in config if needed

### Debug Mode

```bash
bun run test:debug  # Runs with Node.js inspector
```

## Future Improvements

1. **Re-enable Coverage**: When Bun supports V8 coverage
2. **Add Integration Tests**: For end-to-end testing
3. **Performance Testing**: Add benchmark tests
4. **Visual Testing**: Consider adding visual regression tests

## Resources

- [Vitest v4 Documentation](https://vitest.dev/)
- [Vitest Migration Guide](https://vitest.dev/guide/migration.html)
- [Bun Testing Guide](https://bun.sh/docs/cli/test)
- [TypeScript Testing Best Practices](https://vitest.dev/guide/testing-types.html)
