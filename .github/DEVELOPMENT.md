<div align="center">

# Profile Weather View Development Guide

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org) [![Bun](https://img.shields.io/badge/powered%20by-Bun-black?style=flat-square&logo=bun)](https://bun.sh) [![ESLint v9](https://img.shields.io/badge/ESLint-v9-4B32C3?style=flat-square&logo=eslint)](https://eslint.org/) [![Vitest](https://img.shields.io/badge/tested%20with-Vitest-6E9F18?style=flat-square&logo=vitest)](https://vitest.dev) [![Semantic Release](https://img.shields.io/badge/semantic--release-enabled-e10079?style=flat-square&logo=semantic-release)](https://semantic-release.gitbook.io/semantic-release/)

<p align="center">
  <i>A comprehensive guide for developing Profile Weather View</i><br>
  <small>This document outlines the development workflow, architecture, and best practices</small>
</p>

</div>

<div align="center">

[Project Architecture](#project-architecture) • [Development Setup](#development-setup) • [Workflow](#development-workflow) • [Testing](#testing-strategy) • [CI/CD](#cicd-pipeline) • [Release Process](#release-process) • [Code Quality](#code-quality-standards) • [Troubleshooting](#troubleshooting)

</div>

## Project Architecture

### Directory Structure

```
profile-weather-view/
├── .github/                  # GitHub-specific configuration files
│   ├── workflows/            # GitHub Actions workflows
│   ├── CONTRIBUTING.md       # Contribution guidelines
│   └── DEVELOPMENT.md        # This file - development workflow
├── image/                    # Static image assets
│   ├── architecture.png      # Architecture diagram
│   └── readme_cover.png      # README banner image
├── script/                   # Utility scripts
│   └── run-release.sh        # Manual release trigger script
├── src/                      # Source code
│   ├── __tests__/            # Test files
│   │   ├── benchmarks/       # Performance benchmarks
│   │   └── unit/             # Unit tests
│   ├── config/               # Configuration modules
│   ├── types/                # TypeScript type definitions
│   └── weather-update/       # Core application code
│       ├── services/         # Core services
│       └── utils/            # Utility functions
├── coverage/                 # Test coverage reports (git-ignored)
├── test-results/             # Test output files (git-ignored)
├── eslint.config.mjs         # ESLint configuration
├── package.json              # Project metadata and dependencies
├── tsconfig.json             # TypeScript configuration
└── vitest.config.ts          # Test runner configuration
```

### Core Components

<div align="center">

[![Architecture](https://mermaid.ink/img/pako:eNp1kk9rAjEQxb_KMKdeWrCu62EvvbRQKLTgVuopZDeZbrDJhGRi0bLfvZNstXVFAwkz7_3m3yQFhQZqaORsaYXXzWoyM04oGCrEd9R9pWXkIQC38M2778pMd1QHq2Rdmav1Y3qaR2PZsc2VVLM3DrQy8Pm4xxkLxNjTphaZJ1jwCLerqZtVqOU5u-bmQnVp1QYm7I-b-WeVprZCXdRUDZNdKRfVJPNJwnjvxfXWMDYG29paOreZC5UbLZUCxm2VldTa_2tqVNWzj-r9EsEdS-OCvmvpeSZiXzpHQc87jfJOiYB60x_2xvzEYCLUYKiVEhBYxJhooLE_pTmz38XDiTMpdaMaTYGTKXRwEka4Wkhov6D9h80dGVRQk-XEfXUdKv_LMGGXPKGu5F001P_GL2DsCmM?type=png)](https://mermaid.live/edit#pako:eNp1kk9rAjEQxb_KMKdeWrCu62EvvbRQKLTgVuopZDeZbrDJhGRi0bLfvZNstXVFAwkz7_3m3yQFhQZqaORsaYXXzWoyM04oGCrEd9R9pWXkIQC38M2778pMd1QHq2Rdmav1Y3qaR2PZsc2VVLM3DrQy8Pm4xxkLxNjTphaZJ1jwCLerqZtVqOU5u-bmQnVp1QYm7I-b-WeVprZCXdRUDZNdKRfVJPNJwnjvxfXWMDYG29paOreZC5UbLZUCxm2VldTa_2tqVNWzj-r9EsEdS-OCvmvpeSZiXzpHQc87jfJOiYB60x_2xvzEYCLUYKiVEhBYxJhooLE_pTmz38XDiTMpdaMaTYGTKXRwEka4Wkhov6D9h80dGVRQk-XEfXUdKv_LMGGXPKGu5F001P_GL2DsCmM)

</table>
</div>

The application is organized around these main components:

| Component | Description |
|-----------|-------------|
| **index.ts** | Entry point that orchestrates the workflow |
| **fetchWeather.ts** | Service for retrieving weather data from OpenWeather API |
| **updateReadme.ts** | Service for updating GitHub profile README |
| **preload.ts** | Utilities for environment validation and setup |

### Data Flow

1. **Initialization**: Application starts in `index.ts`
2. **Environment Validation**: `preload.ts` verifies API keys and configuration
3. **Weather Data Retrieval**: `fetchWeather.ts` calls the OpenWeather API
4. **README Generation**: `updateReadme.ts` updates the profile with weather data

## Development Setup

### Prerequisites

| Requirement | Version | Description |
|-------------|---------|-------------|
| **Bun** | ≥ 1.2.0 | JavaScript runtime and package manager |
| **Node.js** | ≥ 22.0.0 | Required for some development tools |
| **Git** | Latest | Version control |
| **OpenWeather API Key** | N/A | Required for weather data fetching |

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/profile-weather-view.git
cd profile-weather-view

# Install dependencies
bun install

# Configure environment
echo "OPEN_WEATHER_KEY=your_api_key_here" > .env

# Verify setup
bun run check-all
```

### Editor Configuration

This project works best with Visual Studio Code with these extensions:

- **ESLint**: Code quality and style checking
- **Prettier**: Code formatting
- **TypeScript Hero**: Import organization
- **Error Lens**: Enhanced error visibility
- **GitLens**: Git integration

## Development Workflow

### Branch Strategy

<div align="center">

![Branch Strategy](https://mermaid.ink/img/pako:eNplksFKxDAQhl9lmJNeWnDdVQ-99CKIILjgVfQQ0mbabiDJhGS6pWXffdNs3XYVJgkz3_wzfyYFGTUn6FQht_Ny5o2axEpbdMQlPHDfO62CDCl4Qy-Bflfm9Jm1tVaVNRpwPm6rZJQ0BpY3JqeBsNlfRMmhkTiIxDQbWX5Yg9vvlwavaCdITdxo1vb3WW4q5AdQbMH3RcsvH1qFaLShwLgflyFMCLKzVeO28OYjfbydsKvlE52ylvmbfOtsUzjQcL1aFVuPkwIwrJVVbXJB6XMNZYYYeQqtbPCmfxcDx3JvpescZzOY4SjkcLeSUH9B8w92DxRxBp0aTg_QGVdDiEHH5OxeJYr9n-gXo0Vcwg?type=png)

</div>

We use a simplified two-branch strategy optimized for solo development:

- **`master`**: Production branch, always stable and deployable
- **`develop`**: Development branch where feature work occurs

### Development Cycle

1. **Start in develop branch**
   ```bash
   git checkout develop
   git pull origin develop
   ```

2. **Make your changes**
   - Implement features or fixes
   - Write tests for new functionality
   - Run local quality checks

3. **Commit changes** using conventional commits format
   ```bash
   # Use the interactive commit tool for proper formatting
   bun run commit

   # Example conventional commits:
   # feat: add multi-timezone support
   # fix: handle network timeouts gracefully
   # docs: update API documentation
   ```

4. **Push changes** to trigger automated PR
   ```bash
   git push origin develop
   ```

5. **Review the automatically created PR**
   - Check validation results in GitHub Actions
   - Address any issues that arise

6. **Merge using "Squash and merge"**
   - This keeps the commit history clean
   - Triggers the release process automatically

7. **Sync develop with master** after release
   - This happens automatically through GitHub Actions
   - Ensures develop has all version bumps and changelog updates

## Testing Strategy

### Testing Levels

<div align="center">
<table>
  <tr>
    <td align="center">
      <h3>🧪</h3>
      <b>Unit Tests</b><br>
      <small>Individual components</small>
    </td>
    <td align="center">
      <h3>⚡</h3>
      <b>Performance Tests</b><br>
      <small>Execution benchmarks</small>
    </td>
  </tr>
</table>
</div>

This project implements a comprehensive testing approach:

- **Unit Tests**: Test individual components in isolation
- **Performance Benchmarks**: Ensure code meets performance standards

### Test Directory Structure

```
src/__tests__/
├── setup.ts               # Test environment setup
├── unit/                  # Unit tests matching source structure
│   ├── index.test.ts
│   ├── services/
│   │   ├── fetchWeather.test.ts
│   │   └── updateReadme.test.ts
│   └── utils/
│       └── preload.test.ts
└── benchmarks/            # Performance benchmarks
    ├── index.benchmark.ts
    ├── services/
    │   ├── fetchWeather.benchmark.ts
    │   └── updateReadme.benchmark.ts
    └── utils/
        └── preload.benchmark.ts
```

### Testing Commands

| Command | Description |
|---------|-------------|
| `bun run test` | Run all tests |
| `bun run test:watch` | Run tests in watch mode |
| `bun run test:coverage` | Generate coverage report |
| `bun run test:ci` | Run tests in CI environment |

### Coverage Requirements

This project maintains **100% code coverage** requirements for:

- Statements
- Branches
- Functions
- Lines

Pre-commit hooks and CI processes enforce these coverage requirements.

## CI/CD Pipeline

<div align="center">

![CI/CD Pipeline](https://mermaid.ink/img/pako:eNptVE1r20AQ_SsjSlJoAnIcO20vvRVKC23BlByKDkJerbWCpF1rd2WXEP_3zq6+LNmhCLSaN2_ezLzd7JUzLrXKpdNKsWUQ80YpM1ckPcGZ18PFfeukI3l5IfmHJMFP0veHlFSv93oKbZRpjcOVYRLaNZTlvaGJ2Iuh87KhiK2NvImSN29z-UFlZ-rr1cHvWsGSlQde8RWoXal0qQbWCPtcey83YTfkHvz_Aq6d5oRIorzAlHgBY5uQVz4MBay8jCb3Oo_G4_FMO3rVtrP8K0frKkM-Z7WmzNjykfdkJ56PpMkanSsYCwd-wJqsE6CwjlzHzWbTbussWmQpGkfXsE5uIQCZocQy4FoZPoQSgGamBcwrmkRRBHMtl0Eq_X74-rsNycgoJeMIC-LoC8wa3p6U0BLc5kuNBlCBbYyWlqOl1gbgL8TTYdojlaG7SKNF5c0w1gSnBdj9nyJTEdfyCjd6UH3BUOL5DyXPbWUpTwzlWVPBAocXK9A4xAsLZWztJ6xOxljC4IEYxoU-K8OZufLyA8-d3omldq20K0fRShw2Ei2BdAGbGOsc9iLd2mftbn7sRqZgSkIE7WQAngtYEtCOP-fa4vguFDl9-VgURIRrpG6lFEw3SnRK4cQVj45Rtap1ozfiUQzxEM5W3E5lvNhtw65VXtpF2Sr9FCaft24ytIkUe8tyeHwshKqLcnF-bo-unV3gVRxE69q36_22epqZimtD2wBp4asy64jp02zf3_7YVzRObiUemr1INuK28SMsfT-qFeTedu7in-7ivzn6gmvHnfjWrFXpFNttu0cHGNX18ADXuNZN88K11vR6vXnbXEcc0Qx_uOM_uIGaHQ?type=png)

</div>

### GitHub Actions Workflows

This project uses several GitHub Actions workflows:

1. **PR Validation**
   - Triggered on: Pull request to `master`
   - Performs: Code quality checks, tests, security scanning
   - File: `.github/workflows/pr-validation.yml`

2. **Release Automation**
   - Triggered on: Push to `develop`
   - Creates PR from `develop` to `master`
   - File: `.github/workflows/release-automation.yml`

3. **Semantic Release**
   - Triggered on: Merge to `master`
   - Creates releases, tags, and updates version
   - File: `.github/workflows/semantic-release.yml`

4. **Branch Synchronization**
   - Triggered on: After release completion
   - Syncs `develop` with `master` to include version bumps
   - Part of: `.github/workflows/release-automation.yml`

### Automated Checks

Every PR undergoes these automated validations:

- **Code Quality**
  - ESLint with custom rule configurations
  - TypeScript type checking
  - Code formatting with Prettier

- **Tests**
  - Unit tests with 100% coverage requirement
  - Performance benchmarks against thresholds

- **Security**
  - Dependency vulnerability scanning
  - Secret detection with GitLeaks
  - SonarQube analysis

- **Compliance**
  - License compatibility checking
  - Conventional commit format validation

## Release Process

### Semantic Versioning

This project follows [semantic versioning](https://semver.org/) (MAJOR.MINOR.PATCH):

- **PATCH**: Bug fixes and minor changes (1.0.0 → 1.0.1)
- **MINOR**: New features, non-breaking (1.0.0 → 1.1.0)
- **MAJOR**: Breaking changes (1.0.0 → 2.0.0)

### Automated Release Flow

1. **Commit Analysis**
   - `semantic-release` analyzes commit messages
   - Determines version bump based on conventional commits
   - Keywords: `feat`, `fix`, `BREAKING CHANGE`

2. **Version Update**
   - Updates version in `package.json`
   - Creates/updates `CHANGELOG.md`
   - Groups changes by type (features, fixes)

3. **Release Generation**
   - Creates Git tag with new version
   - Generates GitHub release with notes
   - Adds visual indicators in release notes

4. **Post-Release**
   - Automatically syncs `develop` with `master`
   - Updates references in related issues/PRs

### Manual Release Trigger

In rare cases, you can trigger a release manually:

```bash
./script/run-release.sh
```

## Code Quality Standards

### TypeScript Best Practices

- **Strict Mode**: Enable strict type checking
- **No Any**: Avoid the `any` type
- **Immutability**: Use `readonly` and `const` where possible
- **Type Guards**: Implement proper runtime type validation
- **Documentation**: JSDoc comments for all exports

### ESLint Configuration

The project uses a modular ESLint configuration:

```
src/config/
├── comments.config.mjs     # ESLint comments plugin rules
├── eslint-prettier.config.mjs  # Prettier integration
├── parser.config.mjs       # Parser options
├── security.config.mjs     # Security rules
├── sort.config.mjs         # Import/export sorting
├── stylistic.config.mjs    # Code style rules
└── unicorn.config.mjs      # Additional best practices
```

### Pre-commit Hooks

Husky pre-commit hooks enforce quality standards:

1. **Conventional Commits**: Enforces commit message format
2. **Lint**: Runs ESLint on changed files
3. **Format**: Applies Prettier formatting
4. **Test Coverage**: Ensures 100% test coverage
5. **Type Checking**: Verifies TypeScript types

## Troubleshooting

### Common Issues

<details>
<summary><b>ESLint configuration errors</b></summary>

If ESLint throws schema validation errors:

```bash
# Fix ESLint schema issues
bun install --force
bun run lint
```
</details>

<details>
<summary><b>Test coverage failures</b></summary>

If tests fail due to coverage thresholds:

1. Check the coverage report in `coverage/index.html`
2. Add tests for uncovered code paths
3. Run `bun run test:coverage` to verify
</details>

<details>
<summary><b>Workflow failures</b></summary>

If GitHub Actions workflows fail:

1. Check the workflow logs in GitHub Actions tab
2. Look for specific error messages
3. Fix the issue locally and push again
</details>

### Getting Help

If you encounter issues not covered here:

1. Search existing GitHub issues
2. Create a new issue with detailed information:
   - Steps to reproduce
   - Error messages
   - Environment details

## Additional Resources

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Bun Documentation](https://bun.sh/docs)
- [Vitest Documentation](https://vitest.dev/)
- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [Semantic Release Documentation](https://semantic-release.gitbook.io/semantic-release/)

---

<div align="center">
  <p>
    <strong>Happy coding!</strong>
  </p>
  <p>
    <small>This development guide is maintained alongside the project codebase.<br>
    Last updated: April 2025</small>
  </p>
</div>
