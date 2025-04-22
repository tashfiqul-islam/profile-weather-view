<div align="center">

# Contributing to Profile Weather View

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://makeapullrequest.com) [![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg?style=flat-square)](https://conventionalcommits.org) [![Bun](https://img.shields.io/badge/powered%20by-Bun-black?style=flat-square&logo=bun)](https://bun.sh) [![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org) [![ESLint v9](https://img.shields.io/badge/ESLint-v9-4B32C3?style=flat-square&logo=eslint)](https://eslint.org/) [![Vitest](https://img.shields.io/badge/tested%20with-Vitest-6E9F18?style=flat-square&logo=vitest)](https://vitest.dev)

<p align="center">
  <i>Thank you for considering contributing to Profile Weather View!</i><br>
  <small>This guide will help you get started and make the contribution process smooth for everyone.</small>
</p>

</div>

<div align="center">

[Development Philosophy](#development-philosophy) • [Getting Started](#getting-started) • [Workflow](#development-workflow) • [Architecture](#code-architecture) • [Quality Standards](#quality-standards) • [Pull Requests](#pull-request-process) • [CI/CD & Automation](#cicd--automation)

</div>

## About This Project

Profile Weather View is a **personal passion project** that displays real-time weather data on GitHub profile READMEs. While it maintains professional-grade code quality standards and practices, it's important to understand that:

- This is a labor of love, not a commercial product
- Development happens during free time, so response times may vary
- Contributions are welcomed with an emphasis on learning and collaboration
- The project serves as both a useful tool and a showcase of modern development practices

The project strives to demonstrate how even personal projects can benefit from proper architecture, testing, and automation while remaining approachable for contributors of all experience levels.

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

## Getting Started

### Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| **Bun** | ≥ 1.2.0 | Required |
| **Node.js** | ≥ 22.0.0 | For some dev tools |
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
echo "OPEN_WEATHER_KEY=your_api_key_here" > .env
```
</details>

<details>
<summary><b>Step 5: Verify Installation</b></summary>

```bash
bun run check-all
```
</details>

## Development Workflow

### Branch Strategy

```
master                # Production-ready code
└── develop           # Integration branch
    ├── feature/*     # New features
    ├── fix/*         # Bug fixes
    ├── refactor/*    # Code improvements
    ├── docs/*        # Documentation updates
    └── test/*        # Test enhancements
```

### Development Cycle

1. **Sync Your Fork**

   ```bash
   git checkout master
   git pull upstream master
   git push origin master
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

### Core Components

Profile Weather View is built around four specialized modules, each with a distinct responsibility:

| Component             | Purpose                                                         |
|-----------------------|-----------------------------------------------------------------|
| **`index.ts`**        | Entry point that orchestrates the application flow              |
| **`fetchWeather.ts`** | Service that retrieves and validates OpenWeather API data       |
| **`updateReadme.ts`** | Service that updates the README with weather information        |
| **`preload.ts`**      | Environment validator that ensures required configuration exists |

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
│   ├── benchmarks/            # Performance benchmarks
│   └── unit/                  # Unit tests
├── config/                    # Configuration modules
└── types/                     # TypeScript type definitions
```

## Quality Standards

### Available Scripts

<div align="center">
<table>
  <tr>
    <th>Category</th>
    <th>Command</th>
    <th>Description</th>
  </tr>
  <tr>
    <td rowspan="2"><b>Development</b></td>
    <td><code>bun run dev</code></td>
    <td>Run app in development mode</td>
  </tr>
  <tr>
    <td><code>bun run start</code></td>
    <td>Build and run the app</td>
  </tr>
  <tr>
    <td rowspan="5"><b>Testing</b></td>
    <td><code>bun run test</code></td>
    <td>Run all tests using Vitest</td>
  </tr>
  <tr>
    <td><code>bun run test:ci</code></td>
    <td>Run tests once (for CI/CD)</td>
  </tr>
  <tr>
    <td><code>bun run test:watch</code></td>
    <td>Watch mode (re-run on file change)</td>
  </tr>
  <tr>
    <td><code>bun run test:coverage</code></td>
    <td>Generate coverage report</td>
  </tr>
  <tr>
    <td><code>bun run test:staged</code></td>
    <td>Test only staged files</td>
  </tr>
  <tr>
    <td rowspan="4"><b>Quality</b></td>
    <td><code>bun run lint</code></td>
    <td>Run ESLint with auto-fix</td>
  </tr>
  <tr>
    <td><code>bun run format</code></td>
    <td>Format code using Prettier</td>
  </tr>
  <tr>
    <td><code>bun run check-all</code></td>
    <td>Type-check + Lint + Format + Test (CI-safe)</td>
  </tr>
  <tr>
    <td><code>bun run format-all</code></td>
    <td>Type-check + Test + Format + Lint (with fixes)</td>
  </tr>
</table>
</div>

### TypeScript Guidelines

- **Strict Mode**: All files must use TypeScript's strict mode
- **No `any`**: Use proper type definitions or `unknown` with type guards
- **Documentation**: All exported functions require JSDoc comments
- **Immutability**: Use `readonly` and `const` wherever possible
- **Type Guards**: Implement type guards for runtime validation

### Commit Standards

We use [conventional commits](https://www.conventionalcommits.org/) with the following types:

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
    <td><code>security</code></td>
    <td>Security enhancements</td>
  </tr>
</table>
</div>

Format: `type(scope): description`

Examples:
```
feat(weather): add multi-timezone support
fix(api): handle network timeouts gracefully
security(deps): update vulnerable packages
```

### Commit Process

This project uses [Husky](https://typicode.github.io/husky/) to enforce quality standards via pre-commit hooks. When you attempt to commit changes, several automatic checks will run to ensure your code meets the project's standards:

<div align="center">
<table>
  <tr>
    <td align="center">
      <h3>📝</h3>
      <b>Commit Format</b><br>
      <small>Enforced by commitlint</small>
    </td>
    <td align="center">
      <h3>🔍</h3>
      <b>Code Quality</b><br>
      <small>Linting & formatting</small>
    </td>
    <td align="center">
      <h3>🧪</h3>
      <b>Test Coverage</b><br>
      <small>Must maintain 100%</small>
    </td>
    <td align="center">
      <h3>📊</h3>
      <b>Type Safety</b><br>
      <small>TypeScript validation</small>
    </td>
  </tr>
</table>
</div>

#### Pre-Commit Hook Process

1. **Commit Message Validation**
   - Enforces the [Conventional Commits](#commit-standards) format
   - Rejects commits with improper formatting
   - Run by commitlint

2. **Code Quality Checks**
   - Runs ESLint on staged files
   - Applies Prettier formatting
   - Ensures code meets style guidelines

3. **Test Coverage Verification**
   - Runs tests on affected files
   - Validates 100% test coverage requirement
   - **Important:** Commits will fail if coverage drops below 100%

4. **Type Checking**
   - Verifies TypeScript types are valid
   - Ensures no type errors are introduced

#### The 100% Test Coverage Requirement

This project maintains a strict 100% test coverage policy across all metrics:

<div align="center">
<table>
  <tr>
    <th>Metric</th>
    <th>Required</th>
    <th>Description</th>
  </tr>
  <tr>
    <td><b>Statements</b></td>
    <td>100%</td>
    <td>Every statement in the code</td>
  </tr>
  <tr>
    <td><b>Branches</b></td>
    <td>100%</td>
    <td>All code paths in conditional statements</td>
  </tr>
  <tr>
    <td><b>Functions</b></td>
    <td>100%</td>
    <td>All functions and methods</td>
  </tr>
  <tr>
    <td><b>Lines</b></td>
    <td>100%</td>
    <td>Every executable line of code</td>
  </tr>
</table>
</div>

> ⚠️ **Important:** The pre-commit hook will reject your commit if any of these coverage metrics fall below 100%. This ensures all code is properly tested before it's committed.

As configured in `vitest.config.ts`, the coverage thresholds are set to these strict values and are enforced both during development (via Husky) and in CI/CD pipelines.

#### Recommended Commit Workflow

1. Make your code changes
2. Write tests that achieve 100% coverage
3. Run `bun run test:coverage` to verify coverage locally
4. Stage your changes with `git add`
5. Use `bun run commit` for the interactive commit prompt
6. Address any issues flagged by the pre-commit hooks

#### If Pre-Commit Hooks Fail

If your commit is rejected:

1. Read the error message to understand which check failed
2. Fix the identified issues:
   - For commit format issues: Rewrite your commit message
   - For code quality issues: Run `bun run format-all`
   - For test coverage issues: Add missing tests
   - For type issues: Fix type errors
3. Stage your changes and attempt to commit again

> 💡 **Tip:** You can use `git commit --no-verify` to bypass hooks in exceptional cases, but this is discouraged and will still be caught by CI checks.

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

2. **PR Requirements**
   - Fill out all sections of the PR template
   - Link to related issues
   - All CI checks must pass before merging
   - PR should be from develop to master branch

3. **Merge Strategy**
   - **Squash and Merge Only**: All PRs are merged using the "Squash and merge" option
   - This creates a single, clean commit on the target branch
   - The PR title becomes the commit message (must follow conventional commits format)
   - All commits in the PR are condensed into this single commit
   - This approach keeps the commit history clean and linear
   - Semantic release uses these squashed commits to determine version changes
   - Linked issues are automatically closed upon merge
<br>
   > ℹ️ **Why Squash and Merge?**
   > As a personal passion project, maintaining a clean, readable commit history is more valuable than preserving every intermediate commit. This approach simplifies the release process and makes the project history easier to navigate.

## CI/CD & Automation

Our project uses GitHub Actions for continuous integration, PR validation, and automated releases. Understanding these workflows will help you contribute more effectively.

### GitHub Workflows

<div align="center">
<table>
  <tr>
    <th>Workflow</th>
    <th>Trigger</th>
    <th>Purpose</th>
  </tr>
  <tr>
    <td><b>PR Validation</b></td>
    <td>Pull Request to master</td>
    <td>Comprehensive validation suite for PR quality</td>
  </tr>
  <tr>
    <td><b>Release</b></td>
    <td>Merge to master</td>
    <td>Automated semantic versioning and release</td>
  </tr>
  <tr>
    <td><b>Dependency Check</b></td>
    <td>Manual/Scheduled</td>
    <td>Security scanning and dependency updates</td>
  </tr>
  <tr>
    <td><b>CodeQL Analysis</b></td>
    <td>Push to master</td>
    <td>Advanced security scanning</td>
  </tr>
</table>
</div>

### Pull Request Validation

When you submit a PR from `develop` to `master`, the following checks are automatically performed:

<div align="center">
<table>
  <tr>
    <td align="center">
      <h3>🔒</h3>
      <b>Security</b><br>
      <small>CodeQL & Vulnerability scanning</small>
    </td>
    <td align="center">
      <h3>🧪</h3>
      <b>Testing</b><br>
      <small>Unit tests & Coverage</small>
    </td>
    <td align="center">
      <h3>📋</h3>
      <b>Quality</b><br>
      <small>ESLint, TypeScript, SonarQube</small>
    </td>
    <td align="center">
      <h3>📝</h3>
      <b>Compliance</b><br>
      <small>License & Commit format</small>
    </td>
  </tr>
</table>
</div>

#### PR Validation Steps

1. **Initialization & Setup**
   - Repository checkout
   - Environment verification
   - Dependency installation

2. **Security Analysis**
   - CodeQL security scanning
   - Dependency vulnerability checks
   - Secret scanning (detecting credentials)

3. **Code Quality**
   - Static analysis (ESLint)
   - TypeScript type checking
   - SonarQube code quality analysis

4. **Test Suite**
   - Runs all unit tests
   - Verifies test coverage meets thresholds
   - Generates and publishes test reports

5. **Compliance Checks**
   - Verifies conventional commit format
   - Scans for license compliance issues
   - Generates SBOM (Software Bill of Materials)

The PR validation only runs for PRs from `develop` to `master` and skips post-merge validation as the changes have already been thoroughly tested.

### Release Process

<div align="center">
<img src="https://mermaid.ink/img/pako:eNp1kU9rAjEQxb_KMKctalHX9VIvFVqhpeBWPYVcJtuM68RJyGRFgvvdm6xd9-BBEHl5vzf50yMliRINdWo2TdLbZjU1XioIkuEd1UE5GXGgB3Dg3YcLY2BPVXAkmyo9W3F-N58_pXw_90l5ckHl7cNBE3skBSu6S8a5kMsP7DBjUzBnqEGUITyLeA9bgQpuYIPQISocXKlRZqWyoq-foXZfyZQYjfcD0-HMzx9z57DBdXXZo3rul5kJjeNwWywZvOzYisWRibhZ1pqF-JM1-oorzULFJAxX9HfE13D02x9OmFec6CU52gTdtarHnLc_dUMNGW0n1BdCpDE2VEZzIcnjuqG2j__Z2FD-e9jQLj5pUEWD1vqELogK4MF4pd6jkZbhVnalVm2Kz9JQ1LGkhZuwzRJFIRFlu3ZFP5YoIlXJisgn7-Y6UA?type=png" width="80%" alt="Release Process Flowchart" />
</div>

Our project uses [semantic-release](https://github.com/semantic-release/semantic-release) for automated releases with the following flow:

1. **Commit Analysis**
   - Analyzes conventional commit messages
   - Determines version bump (major/minor/patch)
   - Skips release if no relevant changes found

2. **Version Bumping**
   - Updates version in package.json
   - Creates/updates CHANGELOG.md with release notes
   - Groups changes by commit type (features, fixes, etc.)

3. **Release Generation**
   - Creates a GitHub release with release notes
   - Tags the commit with version number
   - Marks as "Latest" in GitHub releases page

4. **Release Notifications**
   - Comments on relevant PRs with version they're included in
   - Updates referenced issues with release information

#### Custom Release Features

Our release configuration includes several enhancements:

- **Iconic Section Headers**: Release notes have descriptive icons for different change types (✨ New Features, 🐛 Bug Fixes)
- **Release Type Indicator**: Versions show their change level (Major/Minor/Patch)
- **Clean History**: Filters out merge commits and automated release commits
- **Detailed Changelog**: Structured format with links to commits and PRs

### Dependency Management

The `manual-dependency-check.yml` workflow helps keep dependencies up to date:

- **Scans for Updates**: Checks NPM packages, Bun runtime, GitHub Actions
- **Security Scanning**: Identifies vulnerable dependencies
- **SBOM Generation**: Creates a Software Bill of Materials
- **Dependabot Integration**: Triggers Dependabot to create PRs for updates

You can manually trigger this workflow from the "Actions" tab in GitHub when you want to check for dependency updates.

### Environment Variables

The following environment variables are used in CI/CD workflows:

| Variable | Purpose | Required For |
|----------|---------|-------------|
| `OPEN_WEATHER_KEY` | OpenWeather API access | Local development / Testing |
| `GH_TOKEN` | GitHub authentication | Release automation |
| `SONAR_TOKEN` | SonarQube access | Code quality analysis |
| `SONAR_HOST_URL` | SonarQube server URL | Code quality analysis |

## License and Legal

Profile Weather View is released under the MIT License. By contributing to this project, you agree:

1. Your contributions will be licensed under the same MIT License
2. You have the right to submit your contributions (i.e., you own the code or have permission to contribute it)
3. You grant the project maintainers the right to distribute your contributions under the MIT License

See the [LICENSE](../LICENSE) file for the complete terms.

## Community Guidelines

All contributors must follow our Code of Conduct, which emphasizes:

- **Inclusive Language**: Use gender-neutral terms
- **Respectful Communication**: Be kind and professional
- **Constructive Feedback**: Focus on improving the code
- **Collaborative Spirit**: Work together toward solutions

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
