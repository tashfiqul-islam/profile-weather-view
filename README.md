<div align="center">
  <img src="https://github.com/tashfiqul-islam/profile-weather-view/blob/profile-weather-view-v2/image/readme_cover.png" alt="Profile Weather View Cover Image" width="700" height ="400">
</div>

<br>

<div align="center">

# 🌦️ Profile Weather View

<br>

[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/tashfiqul-islam/profile-weather-view/profile-weather-update.yml?style=flat-square&logo=github&label=weather%20update)](https://github.com/tashfiqul-islam/profile-weather-view/actions/workflows/profile-weather-update.yml) [![Code Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen?style=flat-square&logo=vitest)](https://vitest.dev) [![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org) [![Bun](https://img.shields.io/badge/runtime-bun-black?style=flat-square&logo=bun)](https://bun.sh) [![MIT License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](CONTRIBUTING.md) [![Temporal API](https://img.shields.io/badge/using-Temporal_API-ff69b4?style=flat-square)](https://tc39.es/proposal-temporal/docs/) [![Zod](https://img.shields.io/badge/validation-zod-3068B7?style=flat-square&logo=zod)](https://zod.dev)

<br>

<p align="center">
  <b>Transform your GitHub profile into a live weather dashboard</b>
</p>

<p align="center">
  Profile Weather View integrates real-time weather data into your GitHub profile README using OpenWeather API and GitHub Actions automation. Built with TypeScript and Bun, it delivers accurate weather information that updates automatically every 8 hours.
</p>

<details>
<summary><b>📊 Example Weather Display</b></summary>
<br>

<div align="center">

### Current Weather in Uttara, Dhaka

|                                   Weather                                    | Temperature | Sunrise  |  Sunset  | Humidity |
|:----------------------------------------------------------------------------:|:-----------:|:--------:|:--------:|:--------:|
| Clear <img width="15" src="https://openweathermap.org/img/w/01d.png" alt=""> |    32°C     | 06:12:30 | 18:15:45 |   65%    |

<div align="center">
  <h6>
    <em>Last refresh: Friday, March 29, 2025 14:30:22 UTC+6</em>
  </h6>
</div>

</div>

<a href="https://github.com/tashfiqul-islam/profile-weather-view/generate">
  <img src="https://img.shields.io/badge/use%20this-template-brightgreen?style=for-the-badge&logo=github" alt="Use this template">
</a>

</div>
</details>

## 📋 Overview

Profile Weather View automatically updates your GitHub profile README with real-time weather data for your location. Built with TypeScript and modern web technologies, it leverages GitHub Actions for fully automated updates every 8 hours.

<details>
<summary><b>📚 Table of Contents</b></summary>

1. [📋 Overview](#-overview)
2. [✨ Key Features](#-key-features)
3. [🚀 Quick Start](#-quick-start)
   1. [One-Minute Setup](#one-minute-setup)
   2. [Manual Installation](#manual-installation)
4. [⚙️ Configuration](#️-configuration)
   1. [Environment Variables](#environment-variables)
   2. [Location Settings (in fetchWeather.ts)](#location-settings-in-fetchweatherts)
   3. [Display Customization](#display-customization)
5. [🧩 Architecture](#-architecture)
6. [🏗️ Core Components](#️-core-components)
   1. [Data Flow](#data-flow)
7. [⚡ Technology Stack](#-technology-stack)
8. [🛠️ Development](#️-development)
   1. [Prerequisites](#prerequisites)
   2. [Available Scripts](#available-scripts)
   3. [Project Structure](#project-structure)
9. [🔄 CI/CD Pipeline](#-cicd-pipeline)
10. [🧪 Testing](#-testing)
    1. [Testing Strategy](#testing-strategy)
11. [📚 Documentation](#-documentation)
12. [🤝 Contributing](#-contributing)
13. [📜 License](#-license)
14. [🙏 Acknowledgements](#-acknowledgements)

</details>

## ✨ Key Features

<div align="center">
<table>
  <tr>
    <td align="center">
      <h3>🌐</h3>
      <b>Real-time Data</b><br>
      <small>OpenWeather API 3.0</small>
    </td>
    <td align="center">
      <h3>🔄</h3>
      <b>Auto-Updates</b><br>
      <small>Every 8 hours via Actions</small>
    </td>
    <td align="center">
      <h3>🛠️</h3>
      <b>Type Safety</b><br>
      <small>100% TypeScript + Zod</small>
    </td>
  </tr>
  <tr>
    <td align="center">
      <h3>⚡</h3>
      <b>High Performance</b><br>
      <small>Bun runtime optimization</small>
    </td>
    <td align="center">
      <h3>🕒</h3>
      <b>Smart Time Handling</b><br>
      <small>Temporal API integration</small>
    </td>
    <td align="center">
      <h3>🧪</h3>
      <b>Reliability</b><br>
      <small>100% test coverage</small>
    </td>
  </tr>
</table>
</div>

## 🚀 Quick Start

### One-Minute Setup

```bash
# Clone and set up in one command
npx degit tashfiqul-islam/profile-weather-view my-weather-profile && \
cd my-weather-profile && \
bun install && \
echo "OPEN_WEATHER_KEY=your_api_key_here" > .env
```

### Manual Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/tashfiqul-islam/profile-weather-view.git
   cd profile-weather-view
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Configure environment**
   ```bash
   echo "OPEN_WEATHER_KEY=your_api_key_here" > .env
   ```

4. **Run locally**
   ```bash
   bun start
   ```

5. **Setup GitHub Actions**
    - Fork this repository
    - Add your OpenWeather API key as a repository secret named `OPEN_WEATHER_KEY`
    - The workflow will automatically run every 8 hours

## ⚙️ Configuration

Profile Weather View is highly configurable to meet your specific needs.

### Environment Variables

| Variable           | Description             | Example         |
|--------------------|-------------------------|-----------------|
| `OPEN_WEATHER_KEY` | API key for OpenWeather | `a1b2c3d4e5...` |

### Location Settings (in fetchWeather.ts)

| Setting    | Description          | Default                   |
|------------|----------------------|---------------------------|
| `LAT`      | Latitude coordinate  | `23.8759` (Uttara, Dhaka) |
| `LON`      | Longitude coordinate | `90.3795` (Uttara, Dhaka) |
| `TIMEZONE` | Local timezone       | `Asia/Dhaka`              |

### Display Customization

You can customize how the weather data appears in your README by modifying the update template in `updateReadme.ts`. See the [theme integration guide](./src/docs/guide/theme-integration.md) for detailed examples.

## 🧩 Architecture

Profile Weather View follows a clean, modular architecture designed for maintainability and extensibility.

```mermaid
graph TD
    A[GitHub Actions] -->|Triggers| B[index.ts]
    B -->|Calls| C[fetchWeather.ts]
    C -->|Uses| D[OpenWeather API]
    D -->|Returns| C
    C -->|Returns| B
    B -->|Passes data to| E[updateReadme.ts]
    E -->|Updates| F[README.md]
    G[preload.ts] -->|Configures| B
```

## 🏗️ Core Components

Profile Weather View is built around four specialized modules, each with a distinct responsibility:

| Component             | Purpose                                                                         |
|-----------------------|---------------------------------------------------------------------------------|
| **`index.ts`**        | Application entry point and orchestrator that manages the flow between services |
| **`fetchWeather.ts`** | Weather service that retrieves and validates data from the OpenWeather API      |
| **`updateReadme.ts`** | Service that updates the README with new weather data                           |
| **`preload.ts`**      | Environment validator that ensures required configuration is present            |

### Data Flow

1. **Initialization**: Load and validate environment variables
2. **Data Acquisition**: Fetch and validate weather data from OpenWeather API
3. **Display**: Update README with formatted weather information
4. **Completion**: Report success or provide troubleshooting details

## ⚡ Technology Stack

<div align="center">

[![Bun](https://img.shields.io/badge/runtime-bun-black?style=flat-square&logo=bun)](https://bun.sh) [![TypeScript](https://img.shields.io/badge/language-typescript-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/) [![OpenWeather API](https://img.shields.io/badge/api-openweather-eb6e4b?style=flat-square&logo=openweathermap)](https://openweathermap.org/api) [![Temporal API](https://img.shields.io/badge/datetime-temporal_api-ff69b4?style=flat-square)](https://tc39.es/proposal-temporal/docs/) [![Zod](https://img.shields.io/badge/validation-zod-3068B7?style=flat-square&logo=zod)](https://zod.dev) [![GitHub Actions](https://img.shields.io/badge/ci%2Fcd-github_actions-2088FF?style=flat-square&logo=github-actions)](https://github.com/features/actions) [![Vitest](https://img.shields.io/badge/testing-vitest-6E9F18?style=flat-square&logo=vitest)](https://vitest.dev) [![ESLint v9](https://img.shields.io/badge/linting-eslint_v9-4B32C3?style=flat-square&logo=eslint)](https://eslint.org/)

</div>

## 🛠️ Development

### Prerequisites

- [Bun](https://bun.sh) >= 1.0.0
- [OpenWeather API Key](https://openweathermap.org/api)
- [GitHub Account](https://github.com)

### Available Scripts

```bash
# Development
bun run dev              # Run development mode
bun run start            # Build and run

# Build
bun run build            # Standard build
bun run build:prod       # Production build with minification

# Testing
bun run test             # Run all tests
bun run test:ci          # Run tests in CI mode
bun run test:watch       # Run tests in watch mode
bun run test:coverage    # Generate coverage report

# Quality
bun run lint             # Run ESLint and fix issues
bun run format           # Run Prettier and fix formatting
bun run type-check       # Check TypeScript types
bun run check-all        # Run all quality checks

# Documentation
bun run docs:dev         # Develop documentation
bun run docs:build       # Build documentation
bun run docs:preview     # Preview built documentation
```

### Project Structure

```
profile-weather-view/
├── .github/
│   └── workflows/              # GitHub Actions automation
│       └── profile-weather-update.yml
├── .husky/                     # Git hooks for code quality
├── src/
│   ├── __tests__/              # Comprehensive test suite
│   ├── config/                 # Configuration modules
│   ├── docs/                   # Documentation files
│   └── weather-update/         # Core application
│       ├── services/
│       │   ├── fetchWeather.ts # Weather API integration
│       │   └── updateReadme.ts # README file manipulation
│       ├── utils/
│       │   └── preload.ts      # Environment validation
│       └── index.ts            # Entry point
├── .env                        # Environment variables (gitignored)
├── bunfig.toml                 # Bun runtime configuration
├── eslint.config.mjs           # ESLint flat configuration (v9)
├── prettier.config.mjs         # Prettier configuration
├── tsconfig.json               # TypeScript configuration
├── commitlint.config.mjs       # Commit message validation
└── vitest.config.ts            # Test runner configuration
```

## 🔄 CI/CD Pipeline

The application uses GitHub Actions for automated deployment with the following key features:

<div align="center">
  <table>
    <tr>
      <th align="center">Feature</th>
      <th align="center">Benefit</th>
    </tr>
    <tr>
      <td align="center"><b>Multi-Stage Pipeline</b></td>
      <td align="center">Preflight, execution, verification, and recovery stages</td>
    </tr>
    <tr>
      <td align="center"><b>Scheduled Updates</b></td>
      <td align="center">Automatic refresh every 8 hours</td>
    </tr>
    <tr>
      <td align="center"><b>Self-Healing</b></td>
      <td align="center">Automatic recovery with configurable retries</td>
    </tr>
    <tr>
      <td align="center"><b>Optimized Caching</b></td>
      <td align="center">Dependency and test result caching for faster runs</td>
    </tr>
    <tr>
      <td align="center"><b>Manual Control</b></td>
      <td align="center">Custom workflow parameters for on-demand execution</td>
    </tr>
  </table>
</div>

## 🧪 Testing

The project has comprehensive test coverage to ensure reliability:

```
% Coverage report from v8
------------------|---------|----------|---------|---------|-------------------
File              | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
------------------|---------|----------|---------|---------|-------------------
All files         |     100 |      100 |     100 |     100 |
 src              |     100 |      100 |     100 |     100 |
  index.ts        |     100 |      100 |     100 |     100 |
 src/services     |     100 |      100 |     100 |     100 |
  fetchWeather.ts |     100 |      100 |     100 |     100 |
  updateReadme.ts |     100 |      100 |     100 |     100 |
 src/utils        |     100 |      100 |     100 |     100 |
  preload.ts      |     100 |      100 |     100 |     100 |
------------------|---------|----------|---------|---------|-------------------
```

### Testing Strategy

- **Unit Tests**: Isolated testing of functions and components
- **Integration Tests**: Verify component interactions
- **Mocks**: Simulation of external dependencies
- **Performance Benchmarks**: Measure execution speed

## 📚 Documentation

Comprehensive documentation is available in the [`src/docs/`](./src/docs/) directory, including:

<div align="center">
  <table>
    <tr>
      <td align="center"><a href="src/docs/guide/introduction.md">🚀 Getting Started</a></td>
      <td align="center"><a href="src/docs/guide/architecture.md">🏗️ Architecture</a></td>
      <td align="center"><a href="src/docs/reference/api-reference.md">📋 API Reference</a></td>
      <td align="center"><a href="src/docs/reference/configuration.md">⚙️ Configuration</a></td>
    </tr>
    <tr>
      <td align="center"><a href="src/docs/guide/deployment.md">🚢 Deployment</a></td>
      <td align="center"><a href="src/docs/guide/testing.md">🧪 Testing</a></td>
      <td align="center"><a href="src/docs/guide/theme-integration.md">🎨 Theme Integration</a></td>
      <td align="center"><a href="src/docs/guide/troubleshooting.md">🔧 Troubleshooting</a></td>
    </tr>
  </table>
</div>

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Run tests**: `bun test`
5. **Commit changes**: Use conventional commit format
6. **Push to your fork**: `git push origin feature/amazing-feature`
7. **Open a pull request**

For detailed contribution guidelines, please refer to the [Contributing Guide](.github/contributing.md).

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
Copyright (c) 2025 Tashfiqul Islam
```

## 🙏 Acknowledgements

<div align="center">
  <table>
    <tr>
      <td align="center">
        <a href="https://openweathermap.org/">
          <img src="https://openweathermap.org/themes/openweathermap/assets/vendor/owm/img/icons/logo_60x60.png" width="50" alt="OpenWeather"><br>
          <b>OpenWeather API</b>
        </a><br>
        <sub>Real-time weather data</sub>
      </td>
      <td align="center">
        <a href="https://bun.sh">
          <img src="https://user-images.githubusercontent.com/709451/182802334-d9c42afe-f35d-4a7b-86ea-9985f73f20c3.png" width="50" alt="Bun"><br>
          <b>Bun</b>
        </a><br>
        <sub>Blazing fast runtime</sub>
      </td>
      <td align="center">
        <a href="https://www.typescriptlang.org/">
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Typescript_logo_2020.svg/512px-Typescript_logo_2020.svg.png" width="50" alt="TypeScript"><br>
          <b>TypeScript</b>
        </a><br>
        <sub>Type safety</sub>
      </td>
    </tr>
    <tr>
      <td align="center">
        <a href="https://tc39.es/proposal-temporal/docs/">
          <img src="https://avatars.githubusercontent.com/u/1725583?s=200&v=4" width="50" alt="TC39"><br>
          <b>Temporal API</b>
        </a><br>
        <sub>Modern date/time handling</sub>
      </td>
      <td align="center">
        <a href="https://zod.dev">
          <img src="https://zod.dev/logo.svg" width="50" alt="Zod"><br>
          <b>Zod</b>
        </a><br>
        <sub>Schema validation</sub>
      </td>
      <td align="center">
        <a href="https://github.com/features/actions">
          <img src="https://github.githubassets.com/images/modules/site/features/actions-icon-actions.svg" width="50" alt="GitHub Actions"><br>
          <b>GitHub Actions</b>
        </a><br>
        <sub>CI/CD automation</sub>
      </td>
    </tr>
  </table>
</div>

---

<div align="center">
  <p>
    <a href="https://github.com/tashfiqul-islam/profile-weather-view/issues">Report Bug</a>
    ·
    <a href="https://github.com/tashfiqul-islam/profile-weather-view/issues">Request Feature</a>
    ·
    <a href="https://github.com/sponsors/tashfiqul-islam">Sponsor</a>
  </p>
  <p>
    <small>
      Made with ❤️ by <a href="https://github.com/tashfiqul-islam">Tashfiqul Islam</a>
    </small>
  </p>
</div>
