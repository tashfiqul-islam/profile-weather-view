# 🌦️ Profile Weather View

<div align="center">

[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/tashfiqul-islam/profile-weather-view/update-readme.yml?style=flat-square&logo=github&label=weather%20update)](https://github.com/tashfiqul-islam/profile-weather-view/actions/workflows/update-readme.yml)
[![GitHub stars](https://img.shields.io/github/stars/tashfiqul-islam/profile-weather-view?style=flat-square&logo=github)](https://github.com/tashfiqul-islam/profile-weather-view/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/tashfiqul-islam/profile-weather-view?style=flat-square&logo=github)](https://github.com/tashfiqul-islam/profile-weather-view/network/members)
[![GitHub issues](https://img.shields.io/github/issues/tashfiqul-islam/profile-weather-view?style=flat-square&logo=github)](https://github.com/tashfiqul-islam/profile-weather-view/issues)
[![Test Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen?style=flat-square&logo=vitest)](https://vitest.dev)
[![MIT License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Bun](https://img.shields.io/badge/runtime-bun-black?style=flat-square&logo=bun)](https://bun.sh)
[![Temporal API](https://img.shields.io/badge/using-Temporal_API-ff69b4?style=flat-square)](https://tc39.es/proposal-temporal/docs/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](CONTRIBUTING.md)

<br>

<div align="center">

```
⭐ Transform your GitHub profile into a live weather dashboard ⭐
```

<p align="center">
  <b>Profile Weather View</b> seamlessly integrates real-time weather data into your GitHub profile README using the OpenWeather API and GitHub Actions automation. Built with TypeScript and Bun, it delivers accurate weather information for any location with sunrise, sunset, temperature, and humidity metrics that automatically update every 8 hours.
</p>

<p align="center">
  <i>Set it up once and enjoy dynamic weather updates forever—no maintenance required.</i>
</p>

</div>

<br>

<details>
<summary>📊 Example Weather Display</summary>
<br>

<div align="center">

### Current Weather in Uttara, Dhaka

|                                   Weather                                    | Temperature | Sunrise  |  Sunset  | Humidity |
|:----------------------------------------------------------------------------:|:-----------:|:--------:|:--------:|:--------:|
| Clear <img width="15" src="https://openweathermap.org/img/w/01d.png" alt=""> |    32°C     | 06:12:30 | 18:15:45 |   65%    |

<div align="center">
  <h6>
    <em>Last refresh: Friday, March 08, 2025 14:30:22 UTC+6</em>
  </h6>
</div>

</div>
</details>

<a href="https://github.com/tashfiqul-islam/profile-weather-view/generate">
  <img src="https://img.shields.io/badge/use%20this-template-brightgreen?style=for-the-badge&logo=github" alt="Use this template">
</a>

</div>

<hr>

## 📋 Overview

Profile Weather View dynamically updates your GitHub profile README with real-time weather data for your location. Built with TypeScript and modern web technologies, it leverages GitHub Actions for fully automated updates every 6 hours.

<details open>
<summary><b>📚 Table of Contents</b></summary>

- [📋 Overview](#-overview)
- [✨ Key Features](#-key-features)
- [🚀 Quick Start](#-quick-start)
- [🧩 Architecture](#-architecture)
- [🏗️ Core Components](#core-components)
- [📚 Documentation](#-documentation)
- [⚡ Technology Stack](#-technology-stack)
- [🔄 CI/CD Pipeline](#cicd-pipeline)
- [⚙️ Configuration](#-configuration)
- [🛠️ Development](#-development)
- [🧪 Testing](#-testing)
- [🤝 Contributing](#-contributing)
- [📜 License](#-license)
- [🙏 Acknowledgements](#-acknowledgements)

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
# Clone, install, and set up in one command
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
    - Add your OpenWeather API key as a GitHub secret named `OPEN_WEATHER_KEY`
    - The workflow will automatically run every 8 hours

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

## 🏗️ Project Details

Profile Weather View follows a modular design with four core components working together to deliver real-time weather data to your GitHub profile.

<div align="center">
  <img src="https://mermaid.ink/svg/pako:eNp1kk9v2zAMxb-K4dMKJM6W7JACRbEa7WE7DTnMPtCWmAiVJUGU0xpBvvsoOcm6rTuJ5O_xkXzk0RljgWue9dBz5UBm3NuetjTEvNWqLsBvGFnk7dbaHooULTlpnXT1FBPYI21JBp8OOnpCDWd_n7OlQQcXOmgcKadtwcFdXSNpTZ3s1QK_WasuOeZo-zTkjDVanUkTdyRbCv9BnWrK34QOb2pUgwPUTvoOZvdXtJbTrJrnnM1XkD1kGapGtkBGo0I1vGxAaYcjw9Z79A1CzVW_OaDTvPYWkRY75oWS4OTm0YbAWDEbXcX3dAE6TFcX2Gk8RqfnkOyj6qOeONbYqaFLZo-NWf4rWmvBVpPM40o3OMTd8PDt_WTbPwY_x2tZ4Jc-5dJz_BnPPKUi9YS6XxRWMrB5uKrPrTJonVLGjNHC9NLEeeCm8xHBJqeJYsyLR3dEYIhJvwxvUjhlKZZ-cKYekzUiXCfP5sWBgzgZAzMchDBOMZtY2R-xPJXAbcxm_Bms18w-5uOLZJP6a9IyZNRzwskMb1z8-xbK-qiD8hSqM-oe-mRYCTf_AIzQqI4" alt="Core Components Interaction" width="80%">
</div>

### Core Components

Profile Weather View is built around four specialized modules, each with a distinct responsibility:

| Component             | Purpose                                                                         |
|-----------------------|---------------------------------------------------------------------------------|
| **`index.ts`**        | Application entry point and orchestrator that manages the flow between services |
| **`fetchWeather.ts`** | Weather service that retrieves and validates data from the OpenWeather API      |
| **`updateReadme.ts`** | Service that updates the README with new weather data                           |
| **`preload.ts`**      | Environment validator that ensures required configuration is present            |

### Data Flow

The application follows a unidirectional data flow:

1. **Initialization** — Load and validate environment variables
2. **Data Acquisition** — Fetch and validate weather data from OpenWeather API
3. **Display** — Update README with formatted weather information
4. **Completion** — Report success or provide troubleshooting details

## 📚 Documentation

Comprehensive documentation for the Profile Weather View project is available in the [`src/docs/`](./src/docs/) directory. This includes detailed information on:

<div align="center">
  <table>
    <tr>
      <td align="center"><a href="./src/docs/getting-started.md">🚀 Getting Started</a></td>
      <td align="center"><a href="./src/docs/architecture.md">🏗️ Architecture</a></td>
      <td align="center"><a href="./src/docs/api-reference.md">📋 API Reference</a></td>
      <td align="center"><a href="./src/docs/configuration.md">⚙️ Configuration</a></td>
    </tr>
    <tr>
      <td align="center"><a href="./src/docs/deployment.md">🚢 Deployment</a></td>
      <td align="center"><a href="./src/docs/testing.md">🧪 Testing</a></td>
      <td align="center"><a href="./src/docs/contributing.md">👥 Contributing</a></td>
      <td align="center"><a href="./src/docs/troubleshooting.md">🔧 Troubleshooting</a></td>
    </tr>
  </table>
</div>

<div align="center">
  <a href="./src/docs/README.md">
    <img src="https://img.shields.io/badge/View_Complete_Documentation-Guide-blue?style=for-the-badge" alt="View Complete Documentation">
  </a>
</div>

For comprehensive details on all aspects of the project, please refer to the [Documentation Home](./src/docs/README.md).

## ⚡ Technology Stack

<div align="center">

[![Bun](https://img.shields.io/badge/runtime-bun-black?style=flat-square&logo=bun)](https://bun.sh)
[![TypeScript](https://img.shields.io/badge/language-typescript-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![OpenWeather API](https://img.shields.io/badge/api-openweather-eb6e4b?style=flat-square&logo=openweathermap)](https://openweathermap.org/api)
[![Temporal API](https://img.shields.io/badge/datetime-temporal_api-ff69b4?style=flat-square)](https://tc39.es/proposal-temporal/docs/)
[![Zod](https://img.shields.io/badge/validation-zod-3068B7?style=flat-square&logo=zod)](https://zod.dev)
[![GitHub Actions](https://img.shields.io/badge/ci%2Fcd-github_actions-2088FF?style=flat-square&logo=github-actions)](https://github.com/features/actions)
[![Node.js API](https://img.shields.io/badge/core-node.js_api-339933?style=flat-square&logo=node.js)](https://nodejs.org/api/)
[![ESLint](https://img.shields.io/badge/linting-eslint-4B32C3?style=flat-square&logo=eslint)](https://eslint.org/)

</div>

## CI/CD Pipeline

The application uses GitHub Actions for automated deployment with the following key features:

<div align="center">
  <table>
    <tr>
      <th align="center">Feature</th>
      <th align="center">Benefit</th>
    </tr>
    <tr>
      <td align="center"><b>Two-Job Structure</b></td>
      <td align="center">Early failure detection with preflight checks</td>
    </tr>
    <tr>
      <td align="center"><b>Scheduled Updates</b></td>
      <td align="center">Automatic refresh every 6 hours</td>
    </tr>
    <tr>
      <td align="center"><b>Manual Triggering</b></td>
      <td align="center">Run on-demand with custom parameters</td>
    </tr>
    <tr>
      <td align="center"><b>Dependency Caching</b></td>
      <td align="center">Faster builds with reduced network usage</td>
    </tr>
    <tr>
      <td align="center"><b>Retry Logic</b></td>
      <td align="center">Resilience against temporary API failures</td>
    </tr>
  </table>
</div>

### Required Secrets

You'll need to add one secret to your GitHub repository:

- `OPEN_WEATHER_KEY`: Your OpenWeather API key

### Basic Configuration

```yaml
# Schedule: Every 6 hours at minute 17
cron: '17 */6 * * *'

# Manual inputs available:
inputs:
  location:      # Weather location to display
  force_update:  # Force update even if no changes
  debug:         # Enable verbose logging
```

For detailed information about the deployment process, configuration options, and troubleshooting, please refer to the [full deployment documentation](src/docs/deployment.md).

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

### Bun Configuration (bunfig.toml)

```toml
# Key Bun configuration settings
preload = ["./src/utils/preload.ts"]
smol = false  # Optimized for performance
logLevel = "warn"

[run]
bun = true

[loader]
".ts" = "ts"
```

## 🛠️ Development

### Prerequisites

- [Bun](https://bun.sh) >= 1.0.0
- [OpenWeather API Key](https://openweathermap.org/api)
- [GitHub Account](https://github.com)

### Common Commands

```bash
# Start the application
bun start

# Run tests
bun test

# Check types
bun run typecheck

# Format code
bun run format
```

### Project Structure

```
src/
├── index.ts               # Entry point
├── services/              # Core services
│   ├── fetchWeather.ts    # Weather API integration
│   └── updateReadme.ts    # README modification
└── utils/                 # Utility functions
    └── preload.ts         # Environment setup
```

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

### Testing Strategies

- **Unit Tests**: Each function is tested in isolation
- **Integration Tests**: Services are tested together
- **Mock Tests**: External API calls are mocked
- **Error Handling Tests**: Verify proper error handling

<details>
<summary><b>Completed Milestones</b></summary>
<br>

### Q1 2025
- ✅ Bun runtime integration
- ✅ TypeScript migration
- ✅ Temporal API implementation
- ✅ Optimized CI/CD pipeline
- ✅ 100% test coverage

</details>

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Run tests**: `bun test`
5. **Commit changes**: Use conventional commit format
6. **Push to your fork**: `git push origin feature/amazing-feature`
7. **Open a pull request**

<div align="center">
  <a href="./src/docs/contributing.md">
    <img src="https://img.shields.io/badge/View_Contribution_Guidelines-Documentation-brightgreen?style=for-the-badge" alt="View Contribution Guidelines">
  </a>
</div>

For detailed contribution guidelines, including code style, commit standards, and development workflow, please refer to the [Contributing Documentation](./src/docs/contributing.md).

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
