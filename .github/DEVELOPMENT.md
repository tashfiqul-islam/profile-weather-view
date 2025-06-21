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
| **Bun** | >=1.2.16 | JavaScript runtime and package manager |
| **Node.js** | >=22.0.0 | Required for some development tools |
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

![Branch Strategy](https://mermaid.ink/img/pako:eNplkcFqwzAQhl9l5JNeWlB3XYdeehFEENzwFrqEtJl2g01iSHaVLfu9m2zbtoJgMvPNN_9NlhQYNSfoVCM3w3LmjZrESlpyiEsYvL-vTSkjDs54S-j3pYw4p9baqqxqNeB03FalKGkMLG9MjgZBs78IJYdG4iAW02xkAWI97t9cAa1gnZCaqNm0_j3LTYX8A4ot-L4pWfajVghFGwqc-fAdYQjB3m0atwNvH-Hj7YRXLZ_oFKu5f5m3ziuFBwzXq1Wx9TgpAMNaaa0aLkB9rKHHGHoKrWzwJj-Xg8dyd8k1jjM5jBDuRhx6Jwf0H3D_YA1FEGnRpOADPFWGgAdfkpF4liv2f6BegwVcwg?type=png)

</div>

We use a simplified Git Flow strategy optimized for this project's scale:

- **`master`**: This is the main branch. It is always stable and contains the latest released version. All development work is done in feature branches and merged into master.
- **Feature Branches** (`feat/...`, `fix/...`, etc.): All new development, bug fixes, or chores are done in separate branches. These are created from `master`. Once work is complete, a pull request is opened to merge back into `master`.

### Development Cycle

1. **Create a feature branch from `master`**
   ```bash
   git checkout master
   git pull origin master
   git checkout -b feat/your-feature-name
   ```

2. **Make your changes**
   - Implement features or fixes.
   - Write or update tests for new functionality.
   - Run local quality checks to ensure everything passes.

3. **Commit changes** using the conventional commits format.
   ```bash
   # Use the interactive commit tool for proper formatting
   bun run commit

   # Example conventional commits:
   # feat: add multi-timezone support
   # fix: handle network timeouts gracefully
   # docs: update API documentation
   ```

4. **Push changes** and create a pull request.
   ```bash
   git push origin feat/your-feature-name
   ```
   - Open a pull request from your feature branch to `master`.

5. **Review the Pull Request**
   - The PR will trigger GitHub Actions to run tests, linting, and other checks.
   - Ensure all checks pass and address any feedback.

6. **Merge using "Squash and merge"**
   - This keeps the `master` branch history clean and linear.
   - Merging to `master` automatically triggers the semantic release process, which versions, tags, and releases the new code.

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

![CI/CD Pipeline](https://mermaid.ink/img/pako:eNptkcFqwzAQhl9l5JNeWqC7rkOvFkEEwQ1voS1k2mk32CSGZFerZN97M23bVhCYzDz_zT_JkoJR40yq1cgtMD9zTq1ipSU5xCUMLO7rK2Xk4QlvCf1-lRFn1lorqzqrBYfj9kqlpDEwvDE5GgTN_iKSHAqJhWA0yx4sQK3H_c0V0ArWCaWJmk3rPWW5qZAfQLAF3zclKz9qhVC0ocCYD98RhhDs3apxO_DuIz6-nbCr5ROdcpX5m3zrXBQcaLheLYouJwcBGKhlrZpcQP2so8YYeAqtbPASP5eDx3J3yTGOcDmOEI5GHHpFB_QfMPdgD0UQadGk4P0AlXV4hBx-TsXiWK_Z_oF6LBVz)

</div>

### GitHub Actions Workflows & Automation

This project uses GitHub Actions and Renovate for a robust CI/CD pipeline.

1.  **Pull Request Validation**:
    *   Triggered on every push to a pull request.
    *   Runs a series of checks:
        *   **Linting & Formatting**: Ensures code style consistency.
        *   **Type Checking**: Validates TypeScript types.
        *   **Unit Tests**: Runs the full test suite with Vitest.
        *   **Code Coverage**: Verifies that 100% coverage is maintained.
    *   These checks must pass before a PR can be merged.

2.  **Automated Release**:
    *   Triggered when a commit is merged to the `master` branch.
    *   Uses `semantic-release` to:
        *   Analyze commit messages to determine the next version number (major, minor, or patch).
        *   Create a new Git tag.
        *   Generate a `CHANGELOG.md` with all the recent changes.
        *   Create a new GitHub Release.

3.  **Automated Dependency Updates**:
    *   **Renovate App**: We use the Renovate GitHub App to keep our dependencies up-to-date.
    *   It runs on a weekly schedule as defined in `renovate.json`.
    *   Renovate automatically creates pull requests to update:
        *   `npm` packages in `package.json`.
        *   GitHub Actions used in our workflows.
    *   Minor and patch updates are configured to be auto-merged if all tests pass.

This automated pipeline ensures that every change is validated, releases are consistent and automated, and dependencies are kept current with minimal manual intervention.

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
