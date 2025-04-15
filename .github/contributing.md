<div align="center">

# Contributing to Profile Weather View

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://makeapullrequest.com) [![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg?style=flat-square)](https://conventionalcommits.org) [![Bun](https://img.shields.io/badge/powered%20by-Bun-black?style=flat-square&logo=bun)](https://bun.sh) [![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org) [![ESLint v9](https://img.shields.io/badge/ESLint-v9-4B32C3?style=flat-square&logo=eslint)](https://eslint.org/) [![Vitest](https://img.shields.io/badge/tested%20with-Vitest-6E9F18?style=flat-square&logo=vitest)](https://vitest.dev)

<p align="center">
  <i>Thank you for considering contributing to Profile Weather View!</i><br>
  <small>This guide will help you get started and make the contribution process smooth for everyone.</small>
</p>

</div>

<div align="center">

[Development Philosophy](#development-philosophy) • [Getting Started](#getting-started) • [Workflow](#development-workflow) • [Architecture](#code-architecture) • [Quality Standards](#quality-standards) • [Pull Requests](#pull-request-process)

</div>

## Development Philosophy

<div align="center">
<table>
  <tr>
    <td align="center">
      <h3>🔒</h3>
      <b>Type Safety</b><br>
      <small>Strong typing throughout</small>
    </td>
    <td align="center">
      <h3>🧩</h3>
      <b>Modularity</b><br>
      <small>Decoupled components</small>
    </td>
    <td align="center">
      <h3>🧪</h3>
      <b>Test-Driven</b><br>
      <small>100% test coverage</small>
    </td>
    <td align="center">
      <h3>⚡</h3>
      <b>Performance</b><br>
      <small>Speed and efficiency</small>
    </td>
  </tr>
</table>
</div>

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

| Requirement | Version | Notes |
|-------------|---------|-------|
| **Bun** | ≥ 1.1.0 | Required |
| **Node.js** | ≥ 20.0.0 | Optional fallback |
| **Git** | Latest | For version control |
| **GitHub Account** | N/A | For pull requests |
| **OpenWeather API Key** | N/A | For local testing |

### First-Time Setup

<details>
<summary><b>Step 1: Fork & Clone</b></summary>

```bash
git clone https://github.com/your-username/profile-weather-view.git
cd profile-weather-view
```
</details>

<details>
<summary><b>Step 2: Setup Git Remote</b></summary>

```bash
git remote add upstream https://github.com/tashfiqul-islam/profile-weather-view.git
```
</details>

<details>
<summary><b>Step 3: Install Dependencies</b></summary>

```bash
bun install
```
</details>

<details>
<summary><b>Step 4: Configure Environment</b></summary>

```bash
cp .env.example .env
# Edit .env with your OpenWeather API key
```
</details>

<details>
<summary><b>Step 5: Verify Installation</b></summary>

```bash
bun run check-all
```
</details>

## Development Environment

### Recommended Tools

<div align="center">
<table>
  <tr>
    <th align="center">Editor</th>
    <th align="center">Extensions</th>
  </tr>
  <tr>
    <td align="center">
      <a href="https://code.visualstudio.com/">
        <img src="https://code.visualstudio.com/assets/images/code-stable.png" width="40" alt="VS Code"/><br>
        <b>VS Code</b>
      </a>
    </td>
    <td>
      <ul>
        <li>ESLint</li>
        <li>Prettier</li>
        <li>TypeScript Error Translator</li>
        <li>Code Spell Checker</li>
        <li>GitLens</li>
        <li>GitHub Copilot</li>
      </ul>
    </td>
  </tr>
</table>
</div>

### Editor Configuration

`.vscode/settings.json` file with the repository to ensure consistent settings:

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

| Hook | Action |
|------|--------|
| **pre-commit** | Runs `format`, `lint`, and `type-check` |
| **commit-msg** | Validates commit messages follow Conventional Commits |
| **pre-push** | Runs tests |

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

<div align="center">
<img src="https://mermaid.ink/img/pako:eNptkU1rwzAMhv-K0GmDdXSXHQbZoWyMXXbaJdRqGzCxg-3QUfp_n9NQRtrlJPTx6JUEe-KJEtKZfzm3R9_BQ9c1xgwAzYeHYVrAqKTFYLc32w0sUCkfYbdv4bOTsn0a1rW9aWbA7NYCNVawV3CJ5cHbDmYKdPfRFaAx4Feg1Wiq1C3g6r5WULQBkR88LWrTTlEb2z5hDzPEOdDkXIbOkYJjYa-VVXhuNBuZtb9BKVWxv6yVMkuJT0fJCzivOKrU4f8PKKOsKzVSbvTHzrDRXCjl_OXIIz6hM9wVo0JT9Gz5DcJmKjHdwJDNZb8nD3bWF1Kdj9gnFDJilBJFR0nm2SXvqXcxpaosJ4oGvV6FzP-20cRUNgXUMoX6B4VWkK8" alt="Development Workflow" width="600" />
</div>

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

<div align="center">
<table>
  <tr>
    <td><b>Services Architecture</b></td>
    <td>Core functionality is organized into service modules</td>
  </tr>
  <tr>
    <td><b>Dependency Injection</b></td>
    <td>Dependencies are passed explicitly</td>
  </tr>
  <tr>
    <td><b>Command Pattern</b></td>
    <td>Operations are encapsulated in reusable commands</td>
  </tr>
  <tr>
    <td><b>Repository Pattern</b></td>
    <td>Data access is abstracted through repositories</td>
  </tr>
  <tr>
    <td><b>Validator Pattern</b></td>
    <td>Input validation is handled through schemas</td>
  </tr>
</table>
</div>

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

<details>
<summary><b>Example</b></summary>

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
</details>

## Quality Standards

### TypeScript Guidelines

| Guideline | Description |
|-----------|-------------|
| **Strict Mode** | All files must use TypeScript's strict mode |
| **No `any`** | Use proper type definitions or `unknown` with type guards |
| **Documentation** | All exported functions require JSDoc comments |
| **Immutability** | Use `readonly` and `const` wherever possible |
| **Type Guards** | Implement type guards for runtime validation |

<details>
<summary><b>Example</b></summary>

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
</details>

### Testing Requirements

I follow a test-driven development approach:

<div align="center">
<table>
  <tr>
    <td align="center">
      <h3>🧪</h3>
      <b>Unit Tests</b><br>
      <small>For all functions</small>
    </td>
    <td align="center">
      <h3>🔄</h3>
      <b>Integration Tests</b><br>
      <small>For all services</small>
    </td>
    <td align="center">
      <h3>🧮</h3>
      <b>Edge Cases</b><br>
      <small>Boundary conditions</small>
    </td>
    <td align="center">
      <h3>📊</h3>
      <b>Coverage</b><br>
      <small>100% code coverage</small>
    </td>
  </tr>
</table>
</div>

<details>
<summary><b>Example</b></summary>

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
</details>

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

I use [conventional commits](https://www.conventionalcommits.org/) with the following types:

<div align="center">
<table>
  <tr>
    <td><code>feat</code></td>
    <td>New features</td>
    <td><code>fix</code></td>
    <td>Bug fixes</td>
  </tr>
  <tr>
    <td><code>docs</code></td>
    <td>Documentation changes</td>
    <td><code>style</code></td>
    <td>Formatting changes</td>
  </tr>
  <tr>
    <td><code>refactor</code></td>
    <td>Code restructuring</td>
    <td><code>perf</code></td>
    <td>Performance improvements</td>
  </tr>
  <tr>
    <td><code>test</code></td>
    <td>Test updates</td>
    <td><code>chore</code></td>
    <td>Build/tool changes</td>
  </tr>
  <tr>
    <td><code>ci</code></td>
    <td>CI configuration changes</td>
    <td><code>build</code></td>
    <td>Build system changes</td>
  </tr>
</table>
</div>

Format: `type(scope): description`

<details>
<summary><b>Examples</b></summary>

```
feat(weather): add multi-timezone support
fix(api): handle network timeouts gracefully
perf(readme): optimize image loading performance
```
</details>

## Pull Request Process

### PR Guidelines

<div align="center">
<table>
  <tr>
    <td align="center">
      <h3>🎯</h3>
      <b>Focused Changes</b><br>
      <small>One feature per PR</small>
    </td>
    <td align="center">
      <h3>📝</h3>
      <b>Documentation</b><br>
      <small>Complete PR template</small>
    </td>
    <td align="center">
      <h3>👀</h3>
      <b>Reviews</b><br>
      <small>Address all comments</small>
    </td>
    <td align="center">
      <h3>✅</h3>
      <b>CI Validation</b><br>
      <small>All checks must pass</small>
    </td>
  </tr>
</table>
</div>

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

## Continuous Integration

All PRs are automatically validated with:

<div align="center">
<table>
  <tr>
    <td align="center">🔍 <b>Type checking</b></td>
    <td align="center">🧹 <b>ESLint</b></td>
    <td align="center">✨ <b>Prettier</b></td>
  </tr>
  <tr>
    <td align="center">🧪 <b>Test execution</b></td>
    <td align="center">📊 <b>Code coverage</b></td>
    <td align="center">🔒 <b>Security scanning</b></td>
  </tr>
</table>
</div>

## Documentation

Documentation is a critical component of our project:

### Code Documentation

<div align="center">
<table>
  <tr>
    <td><b>JSDoc Comments</b></td>
    <td>All exported functions</td>
  </tr>
  <tr>
    <td><b>Inline Comments</b></td>
    <td>Complex logic</td>
  </tr>
  <tr>
    <td><b>Type Definitions</b></td>
    <td>Clear interface descriptions</td>
  </tr>
  <tr>
    <td><b>Examples</b></td>
    <td>Practical usage examples</td>
  </tr>
</table>
</div>

### Project Documentation

- **README.md**: Project overview and quick start
- **CONTRIBUTING.md**: Contribution guidelines (this document)
- **PULL_REQUEST_TEMPLATE.md**: PR template for contributors
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
  <p>
    <a href="https://github.com/tashfiqul-islam/profile-weather-view/issues">
      <img src="https://img.shields.io/badge/report-bug-red.svg?style=flat-square" alt="Report Bug" />
    </a>
    &nbsp;
    <a href="https://github.com/tashfiqul-islam/profile-weather-view/discussions">
      <img src="https://img.shields.io/badge/join-discussions-blue.svg?style=flat-square" alt="Join Discussions" />
    </a>
    &nbsp;
    <a href="https://github.com/sponsors/tashfiqul-islam">
      <img src="https://img.shields.io/badge/sponsor-project-orange.svg?style=flat-square" alt="Sponsor Project" />
    </a>
  </p>
</div>
