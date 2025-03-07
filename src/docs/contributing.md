# Contributing

<div align="center">
  <img src="https://img.shields.io/badge/PRs-Welcome-brightgreen" alt="PRs Welcome">
  <img src="https://img.shields.io/badge/Conventional_Commits-1.0.0-yellow" alt="Conventional Commits">
  <img src="https://img.shields.io/badge/Code_Style-ESLint_+_Prettier-blue" alt="Code Style">
  <img src="https://img.shields.io/badge/Powered_by-Bun-orange" alt="Powered by Bun">
</div>

<div align="center">
  <p><em>Thank you for considering contributing to Profile Weather View!</em></p>
</div>

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Environment](#development-environment)
- [Development Workflow](#development-workflow)
- [Code Quality Standards](#code-quality-standards)
  - [TypeScript Guidelines](#typescript-guidelines)
  - [Testing Requirements](#testing-requirements)
  - [Commit Standards](#commit-standards)
- [Pull Request Process](#pull-request-process)
- [Release Process](#release-process)
- [Community](#community)

## Code of Conduct

This project adheres to a Code of Conduct that establishes how we collaborate and interact with each other. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

We value:

- **Respectful Communication**: Be kind and professional in all interactions
- **Constructive Feedback**: Focus on improving the project, not criticizing others
- **Inclusive Environment**: Welcome contributors of all backgrounds and experience levels

## Getting Started

Follow these steps to set up the project for local development:

1. **Fork the Repository**

   - Click the "Fork" button in the upper right corner of the repository page
   - This creates a copy of the repository in your GitHub account

2. **Clone Your Fork**

   ```bash
   git clone https://github.com/your-username/profile-weather-view.git
   cd profile-weather-view
   ```

3. **Add Upstream Remote**

   ```bash
   git remote add upstream https://github.com/original-owner/profile-weather-view.git
   ```

4. **Create a Branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

   Branch naming convention:

   - `feature/` - New features
   - `fix/` - Bug fixes
   - `docs/` - Documentation updates
   - `refactor/` - Code refactoring
   - `test/` - Test improvements
   - `chore/` - Tooling and configuration changes

## Development Environment

### Prerequisites

- **Bun** (latest version)
- **OpenWeather API Key** (for testing with real data)
- **Text Editor with ESLint & Prettier integration** (VS Code recommended)

### Setup

1. **Install Dependencies**

   ```bash
   bun install
   ```

2. **Set Up Environment Variables**

   - Create a `.env` file in the project root

   ```
   OPEN_WEATHER_KEY=your_api_key_here
   ```

3. **Enable Git Hooks**
   The project uses Husky to automatically set up Git hooks when you run `bun install`. These hooks enforce code quality standards and commit message conventions.

### Editor Configuration

For the best development experience, configure your editor with:

- ESLint extension
- Prettier extension
- TypeScript support

**VS Code Settings**:

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

## Development Workflow

Follow this workflow for a smooth development experience:

1. **Update Your Local Branch**

   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Install Dependencies** (if changed)

   ```bash
   bun install
   ```

3. **Make Your Changes**

   - Write code following the project's style guidelines
   - Add or update tests to cover your changes
   - Update documentation to reflect your changes

4. **Run Quality Checks**

   ```bash
   bun run check-all
   ```

   This command runs:

   - TypeScript type checking
   - ESLint for code quality
   - Prettier for code formatting
   - Vitest for unit tests

5. **Commit Your Changes**

   ```bash
   bun run commit
   ```

   This uses an interactive prompt to create conventional commit messages.

6. **Push Your Changes**

   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request**
   - Go to your fork on GitHub
   - Click "New Pull Request"
   - Select your branch and fill out the PR template
   - Reference any related issues with `Fixes #123` or `Relates to #123`

## Code Quality Standards

### TypeScript Guidelines

- Use strict TypeScript typing (no `any` types unless absolutely necessary)
- Prefer interfaces over type aliases for object types
- Document public functions with JSDoc comments
- Use meaningful variable and function names

```typescript
/**
 * Converts UTC seconds to Dhaka timezone formatted time.
 * @param utcSeconds - UTC timestamp in seconds
 * @returns Formatted time string in HH:MM:SS format
 */
export function convertToDhakaTime(utcSeconds: number): string {
  // Implementation
}
```

### Testing Requirements

- All new features should include tests
- All bug fixes should include tests that prevent regression
- Aim for >80% code coverage
- Write both unit and integration tests when appropriate

```typescript
describe('convertToDhakaTime()', () => {
  it('should convert UTC timestamp to Dhaka time correctly', () => {
    const dhakaTime = convertToDhakaTime(1710000000);
    expect(dhakaTime).toMatch(/\d{2}:\d{2}:\d{2}/);
  });
});
```

### Commit Standards

The project uses [Conventional Commits](https://www.conventionalcommits.org/) for standardized commit messages.

Format: `type(scope): subject`

Types:

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: Code changes that neither fix a bug nor add a feature
- `perf`: Performance improvements
- `test`: Adding or modifying tests
- `chore`: Changes to the build process or auxiliary tools

Examples:

```
feat(weather): add support for multiple locations
fix(api): handle network timeouts gracefully
docs(readme): update installation instructions
test(fetchWeather): add test for API error handling
```

## Pull Request Process

1. **Fill Out the PR Template**

   - Provide a clear description of changes
   - Include screenshots for UI changes
   - Reference related issues

2. **CI Checks**
   All PRs must pass automated checks:

   - Type checking
   - Linting
   - Tests
   - Code coverage

3. **Code Review**

   - Address review comments
   - Keep discussions focused on the code
   - Be open to suggestions for improvement

4. **Approval Requirements**

   - At least one project maintainer must approve
   - All CI checks must pass
   - No unresolved conversations

5. **Merge Strategy**
   - Squash and merge is preferred
   - The PR title should follow the conventional commits format
   - The commit message should reference related issues

## Release Process

The project follows [Semantic Versioning](https://semver.org/) (SemVer).

Version format: `MAJOR.MINOR.PATCH`

- `MAJOR`: Incompatible API changes
- `MINOR`: New functionality (backwards-compatible)
- `PATCH`: Bug fixes (backwards-compatible)

Release workflow:

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Create a release PR
4. After merging, tag the release
5. Publish the GitHub release with release notes

## Community

- **Issues**: Use GitHub Issues for bug reports and feature requests
- **Discussions**: Use GitHub Discussions for questions and community interaction
- **Pull Requests**: Submit PRs for code contributions

When reporting bugs:

- Use the bug report template
- Include steps to reproduce
- Provide expected vs. actual behavior
- Include version information

When requesting features:

- Use the feature request template
- Explain the use case
- Suggest implementation if possible

---

<div align="center">
  <p>
    <strong>Thank you for contributing to Profile Weather View!</strong>
  </p>
  <p>
    <small>Your contributions help make this project better for everyone.</small>
  </p>
</div>
