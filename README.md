<div align="center">
  <img src="/image/readme_cover.png" alt="Profile Weather View banner" width="900">
</div>

<h1 align="center">🌦️ Profile Weather View (v2)</h1>

<p align="center">
  <strong>Automate live weather on your GitHub profile using a modern TypeScript + Bun stack</strong><br>
  <em>Robust CI/CD • Strict quality gates • Zero-maintenance dependency automation</em>
</p>

<p align="center">
  <a href="https://github.com/tashfiqul-islam/profile-weather-view/actions/workflows/profile-weather-update.yml">
    <img alt="Weather Update workflow" src="https://img.shields.io/github/actions/workflow/status/tashfiqul-islam/profile-weather-view/profile-weather-update.yml?style=flat&logo=github&label=weather%20update" />
  </a>
  <a href="https://github.com/tashfiqul-islam/profile-weather-view/actions/workflows/semantic-release.yml">
    <img alt="Release workflow" src="https://img.shields.io/github/actions/workflow/status/tashfiqul-islam/profile-weather-view/semantic-release.yml?style=flat&logo=githubactions&label=release" />
  </a>
  <a href="https://bun.sh">
    <img alt="Powered by Bun" src="https://img.shields.io/badge/powered%20by-bun-000?style=flat&logo=bun" />
  </a>
  <a href="#-quality--testing">
    <img alt="Coverage 100%" src="https://img.shields.io/badge/coverage-100%25-brightgreen?style=flat&logo=vitest" />
  </a>
  <a href="https://www.typescriptlang.org/">
    <img alt="TypeScript" src="https://img.shields.io/badge/typescript-strict-3178C6?style=flat&logo=typescript&logoColor=white" />
  </a>
  <a href="CHANGELOG.md">
    <img alt="Changelog maintained" src="https://img.shields.io/badge/changelog-maintained-orange?style=flat&logo=keepachangelog" />
  </a>
  <a href="https://github.com/semantic-release/semantic-release">
    <img alt="semantic-release (angular)" src="https://img.shields.io/badge/semantic--release-angular-e10079?style=flat&logo=semantic-release" />
  </a>
  <a href="https://renovatebot.com">
    <img alt="Renovate Enabled" src="https://img.shields.io/badge/renovate-enabled-brightgreen?style=flat&logo=renovatebot" />
  </a>
  <a href="LICENSE">
    <img alt="MIT License" src="https://img.shields.io/badge/license-MIT-blue?style=flat&logo=opensourceinitiative" />
  </a>
</p>

---

## 📋 Table of Contents

<details>
<summary><strong>Click to expand navigation</strong></summary>

- [⚡ Quick Start](#-quick-start)
- [✨ Key Features](#-key-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [🏗️ Architecture](#️-architecture)
- [🌦️ Live Weather Demo](#️-live-weather-demo)
- [🚀 Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Local Installation](#local-installation)
  - [Repository Configuration](#repository-configuration)
  - [GitHub Secrets Setup](#github-secrets-setup)
- [⚙️ Configuration](#️-configuration)
  - [Weather Location](#weather-location)
  - [Environment Variables](#environment-variables)
- [🔄 CI/CD Workflows](#-cicd-workflows)
  - [Profile Weather Update](#1-profile-weather-update)
  - [Semantic Release](#2-semantic-release)
  - [Tech Stack Sync](#3-readme-tech-stack-sync)
- [🤖 Dependency Automation](#-dependency-automation)
- [🧪 Quality & Testing](#-quality--testing)
  - [Code Quality Tools](#code-quality-tools)
  - [Testing Framework](#testing-framework)
  - [Coverage Reports](#coverage-reports)
  - [SonarCloud Integration](#sonarcloud-integration)
- [📝 Development Guidelines](#-development-guidelines)
  - [Commit Conventions](#commit-conventions)
  - [Available Scripts](#available-scripts)
  - [Project Structure](#project-structure)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [💬 Support](#-support)

</details>

---

## ⚡ Quick Start

> **TL;DR**: Schedules a workflow 3× daily to fetch current weather (OpenWeather One Call 3.0) and update your profile `README.md`. Built with TypeScript (strict) on Bun for speed, with Zod validation, Temporal polyfill, and robust error handling.

**Key Benefits:**

- **Runtime Performance**: Bun 1.2+ for fast startup and fetch performance
- **Quality Assurance**: 100% unit test coverage (v8 + LCOV), SonarCloud analysis, Ultracite (Biome) linting/formatting, commitlint
- **Automated Delivery**: GitHub Actions with caching, optional signed commits, and semantic-release for automated versioning
- **Zero Maintenance**: Renovate with chore commits that skip CI and do not tag releases

---

## ✨ Key Features

<table>
<tr>
<td width="50%">

### 🚀 **Performance & Runtime**

- **Bun 1.2+** for fast startup and fetch performance
- **TypeScript 5.x** with strict configuration
- **Zod 4 schemas** for runtime validation
- **Temporal polyfill** for robust date handling

</td>
<td width="50%">

### 🌤️ **Weather Integration**

- **OpenWeather One Call 3.0** current weather API
- **Retry logic** with configurable timeouts
- **Error handling** with graceful fallbacks
- **Location-based** weather fetching

</td>
</tr>
<tr>
<td width="50%">

### 🔄 **CI/CD Pipeline**

- **Two dedicated workflows** for updates and releases
- **GitHub Actions** with intelligent caching
- **Optional GPG signing** for authenticated commits
- **Semantic versioning** with automated changelog

</td>
<td width="50%">

### 🛡️ **Quality Assurance**

- **100% test coverage** with Bun Test and v8
- **Ultracite preset** (Biome) for linting/formatting
- **Conventional commits** with commitlint validation
- **SonarCloud** code quality analysis

</td>
</tr>
</table>

### 🎯 **Workflow Details**

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| **Profile Weather Update** | 3× daily schedule + manual | Validates, tests, updates profile README with weather data |
| **Semantic Release** | Push to master + manual | Conventional commits → automated releases and changelog |
| **Tech Stack Sync** | Dependencies change | Updates README tech badges with latest versions |

---

## 🛠️ Tech Stack

<div align="center">

### Core Technologies

<p>
  <a href="https://www.typescriptlang.org/"><img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.9.3-3178C6?style=flat-square&logo=typescript&logoColor=white" /></a>
  <a href="https://bun.sh"><img alt="Bun" src="https://img.shields.io/badge/Bun-1.3.1-000000?style=flat-square&logo=bun&logoColor=white" /></a>
  <a href="https://bun.sh/docs/cli/test"><img alt="Bun Test" src="https://img.shields.io/badge/Bun%20Test-1.3.1-000000?style=flat-square&logo=bun&logoColor=white" /></a>
  <a href="https://github.com/colinhacks/zod"><img alt="Zod" src="https://img.shields.io/badge/Zod-4.1.12-3E67B1?style=flat-square" /></a>
</p>

### Development & Build Tools

<p>
  <a href="https://axios-http.com/"><img alt="Axios" src="https://img.shields.io/badge/Axios-1.13.1-5A29E4?style=flat-square&logo=axios&logoColor=white" /></a>
  <a href="https://github.com/tc39/proposal-temporal"><img alt="Temporal polyfill" src="https://img.shields.io/badge/Temporal-0.5.1-1F2A44?style=flat-square" /></a>
  <a href="https://vitejs.dev/"><img alt="Vite" src="https://img.shields.io/badge/Vite-7.1.12-646CFF?style=flat-square&logo=vite&logoColor=white" /></a>
  <a href="https://biomejs.dev/"><img alt="Biome" src="https://img.shields.io/badge/Biome-2.3.2-60A5FA?style=flat-square&logo=biome&logoColor=white" /></a>
</p>

### Quality & Automation

<p>
  <a href="https://github.com/haydenbleasel/ultracite"><img alt="Ultracite" src="https://img.shields.io/badge/Ultracite-6.0.5-0B7285?style=flat-square" /></a>
  <a href="https://github.com/semantic-release/semantic-release"><img alt="semantic-release" src="https://img.shields.io/badge/semantic--release-25.0.1-e10079?style=flat-square&logo=semantic-release" /></a>
  <a href="https://github.com/evilmartians/lefthook"><img alt="Lefthook" src="https://img.shields.io/badge/Lefthook-2.0.1-000000?style=flat-square&logo=git&logoColor=white" /></a>
  <a href="https://github.com/renovatebot/renovate"><img alt="Renovate" src="https://img.shields.io/badge/Renovate-enabled-1A1F6C?style=flat-square&logo=renovatebot&logoColor=white" /></a>
</p>

### Infrastructure & Services

<p>
  <a href="https://github.com/features/actions"><img alt="GitHub Actions" src="https://img.shields.io/badge/GitHub%20Actions-CI-2088FF?style=flat-square&logo=githubactions&logoColor=white" /></a>
  <a href="https://www.sonarsource.com/products/sonarcloud/"><img alt="SonarCloud" src="https://img.shields.io/badge/SonarCloud-configured-F3702A?style=flat-square&logo=sonarcloud&logoColor=white" /></a>
  <a href="https://openweathermap.org/api/one-call-3.0"><img alt="OpenWeather" src="https://img.shields.io/badge/OpenWeather-API-EE4B2B?style=flat-square&logo=openweather&logoColor=white" /></a>
</p>

</div>

---

## 🏗️ Architecture

<div align="center">
  <img src="/image/architecture.png" alt="Profile Weather View Architecture diagram showing GitHub Actions triggering index.ts orchestrator which calls preload.ts, fetchWeather.ts, and updateReadme.ts" width="900">
  <p><em>High-level data flow: GitHub Actions → orchestrator → weather service → README updater.</em></p>
</div>

### 🔄 How It Works

1. **Scheduled Trigger**: Workflow runs on a schedule (5:23, 13:23, 21:23 Asia/Dhaka) or manually
2. **Weather Processing**: Script `src/weather-update/index.ts` validates environment, fetches current weather, formats output
3. **README Update**: Updates the target README section bounded by HTML comments:

   ```html
   <!-- Example Weather Update -->
   Moderate Rain <img width="15" src="https://openweathermap.org/img/w/10n.png" alt="Moderate Rain icon">
   28°C
   Sunrise: 05:34
   Sunset: 18:31
   Humidity: 84%
   <!-- End of Example Weather Update -->
   ```

4. **Commit & Push**: If changes are detected (or forced), commits and pushes to your profile repo with optional GPG signing

> 📖 **Detailed Documentation**: See the complete system design in [ARCHITECTURE.md](./src/docs/ARCHITECTURE.md)

---

## 🌦️ Live Weather Demo

> **Note**: The update replaces content between the HTML comment markers shown below.

<!-- Hourly Weather Update -->
| Weather | Temperature | Sunrise   | Sunset    | Humidity |
|---------|-------------|-----------|-----------|----------|
| Moderate Moderate Partly Partly Haze   | 25°C        | 05:34     | 18:31     | 88%      |
<!-- End of Hourly Weather Update -->
<em>Last refresh: Thursday, October 30, 2025 at 01:58:52 (UTC+6)</em>

> 💡 **Customization**: You can style this section further in your profile repository; the generator focuses on content generation.

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

- **Bun** ≥ 1.2.19 (recommended for optimal performance)
- **Node.js** ≥ 22 (required for CI tooling)
- **OpenWeather API key** (free tier available): [Get your key here](https://openweathermap.org/api)

### Local Installation

```bash
# Clone the repository
git clone https://github.com/tashfiqul-islam/profile-weather-view.git
cd profile-weather-view

# Install dependencies
bun install

# Set up your API key
export OPEN_WEATHER_KEY=your_api_key

# Run the script locally
bun run dev
```

### Repository Configuration

The workflow updates a profile README hosted at `PROFILE_REPO` (defaults to `tashfiqul-islam/tashfiqul-islam`).

**To configure for your profile:**

1. Open `.github/workflows/profile-weather-update.yml`
2. Update the `PROFILE_REPO` environment variable to your username/username repository

### GitHub Secrets Setup

Navigate to your repository **Settings → Secrets and variables → Actions** and add:

#### Required Secrets

| Secret | Description | Example |
|--------|-------------|---------|
| `OPEN_WEATHER_KEY` | OpenWeather API key | `abcd1234...` |
| `PAT` | Personal Access Token with `repo` scope | `ghp_xxxx...` |

#### Optional Secrets (for GPG signed commits)

| Secret | Description |
|--------|-------------|
| `GPG_PRIVATE_KEY` | ASCII-armored private key |
| `GPG_PASSPHRASE` | Passphrase for the GPG key |
| `GIT_COMMITTER_NAME` | Git committer name |
| `GIT_COMMITTER_EMAIL` | Git committer email |

---

## ⚙️ Configuration

### Weather Location

Configure your location in `src/weather-update/services/fetchWeather.ts`:

```typescript
const LOCATION = { lat: '23.8759', lon: '90.3795' } as const;
```

> 🌍 **Location Setup**: Change these coordinates to your latitude/longitude. The script fetches only "current" data for optimal speed and reliability.

### Environment Variables

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `OPEN_WEATHER_KEY` | ✅ | OpenWeather API key | - |
| `FORCE_UPDATE` | ❌ | Force commit even when data unchanged | `false` |

---

## 🔄 CI/CD Workflows

### 1. Profile Weather Update

**File**: `.github/workflows/profile-weather-update.yml`

- **Schedule**: 3× daily (Asia/Dhaka timezone)
- **Tooling**: `oven-sh/setup-bun@v2`, `actions/setup-node@v4`
- **Caching**: `actions/cache@v4` keyed by `bun.lock`
- **Quality Gates**: Ultracite lint, TypeScript type-check, Bun Test (skippable via input)
- **Artifacts**: Uploads updated README for traceability
- **Authentication**: Uses `PAT` to push to profile repo with optional GPG signing

#### Manual Workflow Inputs

| Input | Type | Description |
|-------|------|-------------|
| `force_update` | boolean | Force commit even if weather data unchanged |
| `skip_tests` | boolean | Bypass quality steps for faster execution |

### 2. Semantic Release

**File**: `.github/workflows/semantic-release.yml`

- **Triggers**: Push to `master` branch, manual dispatch (supports dry-run)
- **Runtime**: Bun for dependency installation/caching, Node LTS for semantic-release execution
- **Authentication**: Uses `GITHUB_TOKEN` for release creation (no PAT required)
- **Skip-CI Handling**: Commits with `[skip ci]`/`[skip actions]` are analyzed but won't create releases
- **Security**: Optional SLSA provenance generation for released assets

#### Release Rules (from `.releaserc.js`)

| Commit Type | Version Bump | Example |
|-------------|--------------|---------|
| `feat:` | Minor | `feat(weather): add hourly forecasts` |
| `fix:` | Patch | `fix(api): handle timeout errors` |
| `chore(deps):` | Patch | `chore(deps): update dependencies` |
| `chore:` (other) | No release | `chore: update documentation` |
| `BREAKING CHANGE:` | Major | Any commit with breaking change footer |

### 3. README Tech Stack Sync

**File**: `.github/workflows/sync-readme-tech-stack.yml`

- **Triggers**: Changes to `package.json` or `bun.lock`, manual dispatch
- **Purpose**: Updates tech stack badges in README with latest dependency versions
- **Authentication**: GPG signed commits with `[skip actions]` to prevent workflow loops
- **Caching**: Bun dependency cache keyed by `bun.lock`
- **Concurrency**: Guarded per Git reference

---

## 🤖 Dependency Automation

**Renovate Configuration** (`renovate.json`) provides:

### 🔄 **Auto-Merge Strategy**

- **Non-major updates**: Auto-merged directly to base branch (`automergeType: "branch"`)
- **Major updates**: Require manual approval via Dependency Dashboard
- **Security fixes**: Auto-merged promptly for immediate protection

### 📝 **Semantic Commits**

- Uses semantic chore commits with `[skip actions]` suffix/body
- Prevents CI triggering for dependency updates
- Maintains clean release history (chore commits don't tag releases)

### 📦 **Dependency Grouping**

- **ESLint ecosystem**: All ESLint-related packages
- **Vitest ecosystem**: Testing framework and related tools
- **TypeScript ecosystem**: TypeScript and type definitions
- **GitHub Actions**: Action version updates
- **Bun versions**: Custom managers with regex for Bun runtime updates

### 🛡️ **Quality Gates**

- Vulnerability fixes prioritized
- Compatibility checks before auto-merge
- Maintains lockfile integrity

---

## 🧪 Quality & Testing

### Code Quality Tools

#### 🎯 **Ultracite (Biome)**

- **Configuration**: `biome.jsonc` (extends `ultracite` preset)
- **Commands**:
  - `bunx ultracite lint` - Lint with automatic fixes
  - `bunx ultracite format` - Code formatting
- **Features**: JavaScript globals configured for Bun, file include rules, style/suspicious overrides

#### ✅ **Commitlint**

- **Configuration**: `commitlint.config.mjs`
- **Standard**: Conventional Commits enforcement
- **Scopes**: `actions`, `bun`, `ci`, `config`, `core`, `deps`, `docs`, `perf`, `release`, `security`, `test`, `types`, `utils`, `weather`

### Testing Framework

#### 🧪 **Bun Test Configuration**

- **Config File**: `bunfig.toml` and `tsconfig.json`
- **Coverage Provider**: v8 with LCOV output at `coverage/lcov.info`
- **Reports**: HTML report generated in `html/` directory
- **Preview**: `bun test --coverage` for local coverage review

#### 🎯 **Coverage Enforcement**

- **CI Thresholds**: Global thresholds ≥ 90% (configurable to 100%)
- **Per-file Enforcement**: Optional via `perFile: true` in config
- **Current Status**: 100% across all metrics

### Coverage Reports

#### 📊 **Coverage Snapshot (v2)**

```text
% Coverage report from v8
---------------------------------------------|---------|---------|-------------------
File                                         | % Funcs | % Lines | Uncovered Line #s
---------------------------------------------|---------|---------|-------------------
All files                                    |  100.00 |   99.88 |
 src\weather-update\services\fetchWeather.ts |  100.00 |  100.00 | 
 src\weather-update\services\updateReadme.ts |  100.00 |   99.52 | 
 tests\setup.ts                              |  100.00 |  100.00 | 
 tests\utils\weather-test-helpers.ts         |  100.00 |  100.00 | 
---------------------------------------------|---------|---------|-------------------
```

#### 📈 **Detailed Metrics**

| Metric      | Coverage | Count |
|-------------|----------|-------|
| **Functions** | 100.00% | 116/116 |
| **Lines**     | 99.88%  | 1,247/1,249 |
| **Branches**  | 100.00% | 326/326 |
| **Statements** | 100.00% | 1,247/1,247 |

### SonarCloud Integration

**Configuration**: `sonar-project.properties`

- **Source Paths**: `sonar.sources=src/`
- **Test Paths**: `sonar.tests=tests/`
- **Coverage Input**: `sonar.javascript.lcov.reportPaths=coverage/lcov.info`
- **TypeScript Config**: `sonar.typescript.tsconfigPaths=tsconfig.json`
- **Exclusions**: Tests, benchmarks, and TypeScript declaration files

---

## 📝 Development Guidelines

### Commit Conventions

**Commitlint** enforces Conventional Commits standard via `commitlint.config.mjs`.

#### 📋 **Commit Format Examples**

```bash
feat(weather): add hourly icon rendering
fix(ci): correct cache key for bun.lock
chore(deps): update zod to 4.0.15 [skip actions]
docs(readme): improve setup section
perf(api): optimize weather data parsing
```

#### 🏷️ **Available Scopes**

| Scope | Purpose | Example |
|-------|---------|---------|
| `actions` | GitHub Actions workflows | `fix(actions): update node version` |
| `bun` | Bun runtime configuration | `chore(bun): update to 1.2.20` |
| `ci` | CI/CD pipeline changes | `feat(ci): add coverage threshold` |
| `deps` | Dependency updates | `chore(deps): bump axios to 1.11.0` |
| `weather` | Weather functionality | `feat(weather): add wind speed` |

### Available Scripts

#### 🛠️ **Development**

```bash
bun run dev            # Run weather script locally
bun run start          # Build then run production version
bun run workflow       # Modern dev workflow script (2025 standards)
```

#### 🏗️ **Build**

```bash
bun run build          # Standard production build
bun run build:prod     # Minified production build
```

#### 🧪 **Testing**

```bash
bun run test           # Bun Test in watch mode
bun run test:ci        # Single test run for CI
bun run test:coverage  # Generate coverage reports (LCOV, HTML, text)
bun run test:fast      # Fast test run with dots reporter
bun run test:quiet     # Silent test execution
```

#### 🎯 **Quality**

```bash
bun run lint           # Ultracite lint with automatic fixes
bun run lint:check     # Lint check only (no fixes)
bun run format         # Ultracite code formatting
bun run type-check     # TypeScript type checking (tsc --noEmit)
bun run check-all      # Run all quality checks: type-check, format:check, lint:check, test:ci
```

#### 🔒 **Security**

```bash
bun run audit          # Security audit of dependencies
bun run validate-deps  # Validate dependency system integrity
```

#### 🚀 **Release**

```bash
bun run semantic-release  # Manual semantic release execution
```

### Project Structure

```text
📦 profile-weather-view/
├─ 📁 .github/
│  └─ 📁 workflows/
│     ├─ 📄 profile-weather-update.yml    # Main weather update workflow
│     ├─ 📄 semantic-release.yml          # Automated release management
│     └─ 📄 sync-readme-tech-stack.yml    # Auto-update README tech badges
├─ 📁 src/
│  ├─ 📁 weather-update/
│  │  ├─ 📁 services/                     # Core services: fetchWeather, updateReadme
│  │  ├─ 📁 utils/                        # Utilities: preload, env validation, rate limiting
│  │  └─ 📄 index.ts                      # Main orchestrator and entry point
│  ├─ 📁 scripts/                         # Utility scripts: dev-workflow.ts, validate-dependency-system.ts
│  └─ 📁 docs/                            # Documentation: ARCHITECTURE.md, CONTRIBUTING.md, etc.
├─ 📁 tests/
│  ├─ 📁 unit/                            # Unit tests for services and utilities
│  ├─ 📁 integration/                     # Integration tests
│  └─ 📁 fixtures/                        # Test fixtures and mock data
├─ 📁 html/                               # Static coverage reports and preview files
├─ 📁 image/                              # Documentation images and diagrams
├─ 📄 biome.jsonc                         # Ultracite/Biome linting and formatting config
├─ 📄 bunfig.toml                         # Bun runtime and test configuration
├─ 📄 renovate.json                       # Renovate dependency automation config
├─ 📄 sonar-project.properties            # SonarCloud code quality analysis config
├─ 📄 tsconfig.json                       # TypeScript strict mode configuration
├─ 📄 lefthook.yml                         # Git hooks configuration for quality gates
├─ 📄 README.md                           # This comprehensive documentation
├─ 📄 LICENSE                             # MIT License
└─ 📄 package.json                        # Project dependencies and scripts
```

---

## 🤝 Contributing

We welcome contributions! Please see our comprehensive guides:

- **[Contributing Guide](./src/docs/CONTRIBUTING.md)** - Complete contribution workflow
- **[Development Guide](./src/docs/DEVELOPMENT.md)** - Detailed development setup

### 🚀 **Quick Contribution Start**

1. **Fork and Clone**

   ```bash
   git clone https://github.com/YOUR_USERNAME/profile-weather-view.git
   cd profile-weather-view
   ```

2. **Install Dependencies**

   ```bash
   bun install
   ```

3. **Create Feature Branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Implement Changes**
   - Follow TypeScript strict mode
   - Add tests for new functionality
   - Update documentation as needed

5. **Run Quality Checks**

   ```bash
   bun run check-all
   ```

6. **Commit Using Conventional Commits**

   ```bash
   git commit -m "feat(scope): your feature description"
   ```

7. **Open Pull Request**
   - Provide clear description
   - Reference any related issues
   - Ensure all checks pass

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### MIT License Summary

```text
MIT License

Copyright (c) 2025 Tashfiqul Islam

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 💬 Support

<div align="center">

### 🌟 **Thanks for visiting!**

*Feedback and support are always welcome.*

<br>

<a href="https://github.com/tashfiqul-islam/profile-weather-view/issues/new?labels=bug&title=%5Bbug%5D%3A+">
  <img src="https://img.shields.io/badge/🐛_Report_Bug-red?style=for-the-badge" alt="Report Bug">
</a>
&nbsp;&nbsp;
<a href="https://github.com/tashfiqul-islam/profile-weather-view/issues/new?labels=enhancement&title=%5Bfeature%5D%3A+">
  <img src="https://img.shields.io/badge/💡_Request_Feature-blue?style=for-the-badge" alt="Request Feature">
</a>
&nbsp;&nbsp;
<a href="https://github.com/sponsors/tashfiqul-islam">
  <img src="https://img.shields.io/badge/💖_Sponsor-pink?style=for-the-badge" alt="Sponsor">
</a>
&nbsp;&nbsp;
<a href="https://github.com/tashfiqul-islam">
  <img src="https://img.shields.io/badge/🐦_Follow-lightblue?style=for-the-badge" alt="Follow">
</a>

<br><br>

### 📚 **Additional Resources**

| Resource | Description |
|----------|-------------|
| [**WORKFLOWS.md**](./src/docs/WORKFLOWS.md) | Detailed workflow documentation |
| [**COMMIT_CONVENTION.md**](./src/docs/COMMIT_CONVENTION.md) | Commit message standards |
| [**RELEASE.md**](./src/docs/RELEASE.md) | Release process documentation |
| [**SCRIPTS.md**](./src/docs/SCRIPTS.md) | Available scripts reference |
| [**UNIT_TESTS.md**](./src/docs/UNIT_TESTS.md) | Testing strategy and examples |

<br>

<sub>**Last refresh**: Wednesday, October 29, 2025 at 02:07:05 AM (UTC+6)</sub>

<br>

<a href="#-table-of-contents">⬆️ **Back to Top**</a>

</div>
