# Contributing to Profile Weather View

<div align="center">

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://makeapullrequest.com)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg?style=flat-square)](https://conventionalcommits.org)
[![Bun](https://img.shields.io/badge/powered%20by-Bun-black?style=flat-square&logo=bun)](https://bun.sh)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![ESLint v9](https://img.shields.io/badge/ESLint-v9-4B32C3?style=flat-square&logo=eslint)](https://eslint.org/)
[![Vitest](https://img.shields.io/badge/tested%20with-Vitest-6E9F18?style=flat-square&logo=vitest)](https://vitest.dev)

<p align="center">
  <i>Thank you for considering contributing to Profile Weather View!</i>
</p>

</div>

## Contents

- [Development Philosophy](#development-philosophy)
- [Getting Started](#getting-started)
- [Development Environment](#development-environment)
- [Development Workflow](#development-workflow)
- [Code Architecture](#code-architecture)
- [Quality Standards](#quality-standards)
- [Pull Request Process](#pull-request-process)
- [Continuous Integration](#continuous-integration)
- [Documentation](#documentation)
- [Community Guidelines](#community-guidelines)

## Development Philosophy

Profile Weather View embraces these core principles:

- **Type Safety**: Strong typing throughout with zero `any` usage
- **Functional Purity**: Pure functions with minimal side effects
- **Modular Design**: Decoupled components with clear responsibilities
- **Test-Driven Development**: Tests as a first-class citizen
- **Developer Experience**: Smooth workflows and clear documentation
- **Performance First**: Optimized for speed and efficiency
- **Accessibility**: Inclusive design for all users

## Getting Started

### Prerequisites

- **Bun**: ≥ 1.1.0 (required)
- **Node.js**: ≥ 20.0.0 (optional fallback)
- **Git**: Latest version
- **GitHub Account**: For pull requests
- **OpenWeather API Key**: For local testing

### First-Time Setup

1. **Fork & Clone**

   ```bash
   git clone https://github.com/your-username/profile-weather-view.git
   cd profile-weather-view
   ```

2. **Setup Git Remote**

   ```bash
   git remote add upstream https://github.com/tashfiqul-islam/profile-weather-view.git
   ```

3. **Install Dependencies**

   ```bash
   bun install
   ```

4. **Configure Environment**

   ```bash
   cp .env.example .env
   # Edit .env with your OpenWeather API key
   ```

5. **Verify Installation**

   ```bash
   bun run check-all
   ```

## Development Environment

### Recommended Tools

- **VS Code** with extensions:
  - ESLint
  - Prettier
  - TypeScript Error Translator
  - Code Spell Checker
  - GitLens
  - GitHub Copilot

### Editor Configuration

A `.vscode/settings.json` file is provided with the repository to ensure consistent settings across contributors:

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "eslint.validate": ["typescript", "javascript"],
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "editor.rulers": [80],
  "files.insertFinalNewline": true,
  "files.trimTrailingWhitespace": true
}
```

### Git Hooks

The project uses [Husky](https://typicode.github.io/husky/) and [Commitlint](https://commitlint.js.org/) to enforce quality standards:

- **pre-commit**: Runs `format`, `lint`, and `type-check`
- **commit-msg**: Validates commit messages follow Conventional Commits
- **pre-push**: Runs tests

Git hooks are automatically installed when you run `bun install`.

## Development Workflow

### Branch Strategy

```
main                 # Production-ready code
└── develop          # Integration branch
    ├── feature/*    # New features
    ├── fix/*        # Bug fixes
    ├── refactor/*   # Code improvements
    ├── docs/*       # Documentation updates
    └── test/*       # Test enhancements
```

### Development Cycle

1. **Sync Your Fork**

   ```bash
   git checkout main
   git pull upstream main
   git push origin main
   ```

2. **Create a Feature Branch**

   ```bash
   git checkout -b feature/my-awesome-feature
   ```

3. **Implement Your Changes**

   - Write code following the [Code Architecture](#code-architecture)
   - Add tests for new functionality
   - Update documentation

4. **Local Quality Checks**

   ```bash
   bun run check-all   # Runs type-check, lint, format, and tests
   ```

5. **Commit Changes**

   ```bash
   bun run commit     # Interactive conventional commits prompt
   ```

6. **Push Changes**

   ```bash
   git push origin feature/my-awesome-feature
   ```

7. **Open a Pull Request**
   - Use the PR template
   - Link related issues
   - Wait for CI checks to pass

## Code Architecture

### Core Design Patterns

Profile Weather View follows these architectural patterns:

- **Services Architecture**: Core functionality is organized into service modules
- **Dependency Injection**: Dependencies are passed explicitly
- **Command Pattern**: Operations are encapsulated in reusable commands
- **Repository Pattern**: Data access is abstracted through repositories
- **Validator Pattern**: Input validation is handled through schemas

### Directory Structure

```
src/
├── weather-update/            # Main module
│   ├── index.ts               # Entry point
│   ├── services/              # Core services
│   │   ├── fetchWeather.ts    # Weather API integration
│   │   └── updateReadme.ts    # README update logic
│   └── utils/                 # Shared utilities
│       └── preload.ts         # Environment validation
├── __tests__/                 # Test suite
│   ├── unit/                  # Unit tests
│   └── integration/           # Integration tests
└── docs/                      # Documentation
```

### Type System

- Use explicit typing with TypeScript 5.8+ features
- Define interfaces for all data structures
- Use type guards for runtime type checking
- Leverage `zod` schemas for API responses

Example:

```typescript
/**
 * Weather data response validated by Zod schema
 */
export interface WeatherData {
  current: {
    humidity: number;
    sunrise: number;
    sunset: number;
    temp: number;
    weather: Array<{
      icon?: string;
      main?: string;
    }>;
  };
}

/**
 * Weather API response schema validation
 */
const WeatherSchema = z.object({
  current: z.object({
    humidity: z.number(),
    sunrise: z.number(),
    sunset: z.number(),
    temp: z.number(),
    weather: z
      .array(
        z.object({
          icon: z.string().optional(),
          main: z.string().optional(),
        }),
      )
      .nonempty(),
  }),
});
```

## Quality Standards

### TypeScript Guidelines

- **Strict Mode**: All files must use TypeScript's strict mode
- **No `any`**: Use proper type definitions or `unknown` with type guards
- **Documentation**: All exported functions require JSDoc comments
- **Immutability**: Use `readonly` and `const` wherever possible
- **Type Guards**: Implement type guards for runtime validation

Example:

```typescript
/**
 * Converts a UTC timestamp to Dhaka timezone time string.
 *
 * @param utcSeconds - UTC timestamp in seconds
 * @returns Formatted time string in HH:MM:SS format
 *
 * @example
 * ```ts
 * const dhakaTime = convertToDhakaTime(1710000000);
 * // Returns "16:30:00"
 * ```
 */
export function convertToDhakaTime(utcSeconds: number): string {
  return Temporal.Instant.fromEpochSeconds(utcSeconds)
    .toZonedDateTimeISO('Asia/Dhaka')
    .toPlainTime()
    .toString()
    .replace(/\.\d+/, ''); // HH:MM:SS format
}
```

### Testing Requirements

We follow a test-driven development approach:

- **Unit Tests**: All functions must have unit tests
- **Integration Tests**: All services must have integration tests
- **Edge Cases**: Handle boundary conditions and error states
- **Coverage**: Maintain 100% code coverage
- **Mocking**: Use explicit mocks for external dependencies

Example:

```typescript
describe('fetchWeatherData()', () => {
  beforeEach(() => {
    vi.stubGlobal('Bun', { env: { OPEN_WEATHER_KEY: 'test-api-key' } });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch weather data successfully', async () => {
    // Arrange
    mockFetchResponse({
      current: {
        humidity: 60,
        sunrise: 1710000000,
        sunset: 1710050000,
        temp: 30,
        weather: [{ icon: '03d', main: 'Cloudy' }],
      },
    });

    // Act
    const weatherData = await fetchWeatherData();
    const expectedSunrise = convertToDhakaTime(1710000000);
    const expectedSunset = convertToDhakaTime(1710050000);

    // Assert
    expect(weatherData).toBe(
      `Cloudy|30|${expectedSunrise}|${expectedSunset}|60|03d`,
    );
  });
});
```

### Code Style

- **ESLint v9**: Modern flat config with TypeScript integration
- **Prettier**: Consistent code formatting
- **Naming**: Clear, descriptive names for variables and functions
- **Comments**: Meaningful comments for complex logic
- **File Size**: Keep files under 300 lines when possible
- **Function Size**: Keep functions under 30 lines when possible

Our ESLint configuration enforces:

- SonarJS quality rules
- Security best practices
- Performance optimizations
- TypeScript strict mode

### Commit Standards

We use [Conventional Commits](https://www.conventionalcommits.org/) with the following types:

- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Formatting changes
- `refactor`: Code restructuring
- `perf`: Performance improvements
- `test`: Test updates
- `chore`: Build process or tooling changes
- `ci`: CI configuration changes
- `build`: Changes affecting build system

Format: `type(scope): description`

Example:
```
feat(weather): add multi-timezone support
fix(api): handle network timeouts gracefully
perf(readme): optimize image loading performance
```

## Pull Request Process

### PR Guidelines

1. **Keep PRs Focused**
   - One feature or bug fix per PR
   - Keep changes under 500 lines when possible

2. **PR Template**
   - Fill out all sections of the PR template
   - Include screenshots for visual changes
   - Document testing steps

3. **Review Process**
   - Address all review comments
   - Maintainers will review within 48 hours
   - CI must pass before merging

4. **Approval Requirements**
   - One approval from a core maintainer
   - All discussions resolved
   - All CI checks passing

5. **Merge Strategy**
   - We use squash and merge
   - PR title becomes the commit message
   - Linked issues are automatically closed

### Continuous Integration

All PRs are automatically validated with:

- TypeScript type checking
- ESLint code quality verification
- Prettier formatting validation
- Vitest test execution
- Code coverage enforcement (100%)
- Dependency vulnerability scanning

## Documentation

Documentation is a critical component of our project:

### Code Documentation

- **JSDoc Comments**: All exported functions
- **Inline Comments**: Complex logic
- **Type Definitions**: Clear interface descriptions
- **Examples**: Practical usage examples

### Project Documentation

- **README.md**: Project overview and quick start
- **CONTRIBUTING.md**: Contribution guidelines (this document)
- **User Guides**: In `src/docs/`
- **Architecture Docs**: System design documents
- **API References**: Function and service documentation

### Documentation Testing

Documentation code samples are tested to ensure they remain accurate:

```typescript
/**
 * @example
 * ```ts
 * const data = await fetchWeatherData();
 * console.log(data); // "Cloudy|30|06:18:00|18:02:00|60|03d"
 * ```
 */
```

## Community Guidelines

### Code of Conduct

All contributors must follow our [Code of Conduct](CODE_OF_CONDUCT.md), which emphasizes:

- **Inclusive Language**: Use gender-neutral terms
- **Respectful Communication**: Be kind and professional
- **Constructive Feedback**: Focus on improving the code
- **Collaborative Spirit**: Work together toward solutions

### Support Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Questions and community interaction
- **Pull Requests**: Code contributions

### Recognition

Contributors are recognized in several ways:

- Listed in the [Contributors](https://github.com/tashfiqul-islam/profile-weather-view/graphs/contributors) page
- Mentioned in release notes for significant contributions
- Opportunities to join as maintainers for consistent contributors

---

<div align="center">
  <p>
    <strong>Thank you for helping make Profile Weather View better!</strong>
  </p>
  <p>
    <small>Your contributions directly improve the experience for all users of this project.</small>
  </p>
</div>
