# Deployment Guide

<div style="text-align: center;">
  <img src="https://img.shields.io/badge/Bun-Runtime-black?logo=bun" alt="Bun Runtime">
  <img src="https://img.shields.io/badge/GitHub-Actions-blue?logo=github" alt="GitHub Actions">
  <img src="https://img.shields.io/badge/OpenWeather-API-orange?logo=openweathermap" alt="OpenWeather API">
</div>

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Local Deployment](#local-deployment)
- [GitHub Actions Deployment](#github-actions-deployment)
- [Monitoring and Maintenance](#monitoring-and-maintenance)
- [Troubleshooting](#troubleshooting)
- [Advanced Deployment Options](#advanced-deployment-options)

## Overview

Profile Weather View is designed to be deployed both locally and as a GitHub Actions workflow.
This guide covers all aspects of deployment,
from setting up your local environment to configuring the automated GitHub Actions workflow for continuous updates.

## Prerequisites

Before deploying Profile Weather View, ensure you have:

- **API Key**: An OpenWeather API key ([Get one here](https://openweathermap.org/api))
- **GitHub Repository**: Access to update your GitHub profile README
- **Bun Runtime**: Version 1.0.0 or later for local development

## Environment Configuration

### Required Environment Variables

The application requires the following environment variables:

| Variable              | Description                     | Required | Default       |
| --------------------- | ------------------------------- | :------: | ------------- |
| `OPEN_WEATHER_KEY`    | Your OpenWeather API key        |   Yes    | None          |
| `PROFILE_README_PATH` | Custom path to your README file |    No    | `./README.md` |
| `BUN_RUNTIME_SAFETY`  | Enable runtime safety features  |    No    | `true`        |
| `LOG_LEVEL`           | Logging verbosity               |    No    | `warn`        |

### Setting Up Environment Variables

#### Local Development

Create a `.env` file in the project root with the following content:

```
OPEN_WEATHER_KEY=your_api_key_here
# Optional variables
PROFILE_README_PATH=../your-username/README.md
LOG_LEVEL=warn
BUN_RUNTIME_SAFETY=true
```

#### GitHub Actions

Add the following secrets to your GitHub repository:

1. Navigate to your repository settings
2. Go to "Secrets and variables" → "Actions"
3. Add a new repository secret named `OPEN_WEATHER_KEY` with your API key

## Local Deployment

### Installing Dependencies

```bash
# Clone the repository
git clone https://github.com/your-username/profile-weather-view.git
cd profile-weather-view

# Install dependencies using Bun
bun install
```

### Running Locally

```bash
# Single execution
bun run dev

# Build and run
bun run start
```

### Running Tests

```bash
# Run all tests
bun test

# Run with coverage
bun test:coverage
```

## GitHub Actions Deployment

Profile Weather View is primarily designed
to run as a GitHub Actions workflow
that automatically updates your GitHub profile README with current weather information.

### Quick Setup

1. Fork or clone this repository
2. Add your OpenWeather API key as a repository secret
3. Update the repository URL in the workflow file (if necessary)
4. Ensure your profile README contains the required markers

### Workflow Configuration

The main workflow file is located at `.github/workflows/profile-weather-update.yml`
and is already configured for optimal performance.

Key features of the workflow:

- Runs on a schedule (three times daily)
- Supports manual triggering with custom parameters
- Implements intelligent caching for dependencies
- Features self-healing mechanisms for reliability
- Uses minimal GitHub Actions permissions

### Required README Markers

Your profile README must contain the following markers for the weather update to work:

```html
<!-- Hourly Weather Update -->
<!-- Your existing content will be replaced -->
<!-- End of Hourly Weather Update -->
```

These markers enable the workflow to identify and update the correct section of your README.

### Advanced Workflow Settings

The workflow supports advanced configuration through manual dispatch:

```yaml
workflow_dispatch:
  inputs:
    debug:
      description: 'Enable debug mode'
      required: false
      default: 'false'
      type: choice
      options:
        - 'true'
        - 'false'
    retry_strategy:
      description: 'API failure retry strategy'
      type: choice
      options:
        - exponential
        - linear
        - none
      default: 'exponential'
    force_update:
      description: 'Force README update regardless of changes'
      type: boolean
      default: false
```

## Monitoring and Maintenance

### Workflow Execution Logs

1. Navigate to the "Actions" tab in your repository
2. Select the "Profile Weather Update" workflow
3. Click on a specific run to view detailed logs

### Common Success Indicators

The following log messages indicate successful operation:

- `✅ Weather data fetched successfully`
- `✅ README updated successfully with new weather data`
- `🎉 Weather update process completed successfully`

### Update Frequency

By default, the workflow runs three times daily:

- 05:23 UTC (morning)
- 13:23 UTC (afternoon)
- 21:23 UTC (evening)

To change this schedule, modify the cron expression in the workflow file.

## Troubleshooting

### Common Issues and Solutions

| Issue              | Possible Cause                        | Solution                                                         |
| ------------------ | ------------------------------------- | ---------------------------------------------------------------- |
| API Key Error      | Missing or invalid `OPEN_WEATHER_KEY` | Verify the secret is set correctly in GitHub repository settings |
| README Not Found   | Incorrect repository or path          | Check the target repository path and ensure README.md exists     |
| No Weather Section | Missing markers in README             | Add the required markers to your README file                     |
| Workflow Timeout   | Network issues or API outage          | Check OpenWeather API status and try manual workflow dispatch    |

### Diagnostic Steps

If the workflow fails:

1. Check the error message in the workflow logs
2. Verify OpenWeather API key is valid and has sufficient quota
3. Ensure the README contains the required markers
4. Check network connectivity to OpenWeather API
5. Examine workflow permissions in repository settings

## Advanced Deployment Options

### Custom Weather Update Schedule

To customize the update frequency, modify the `cron` expression in the workflow file:

```yaml
schedule:
  - cron: '23 5,13,21 * * *' # Current: 3 times daily
  # - cron: "0 */3 * * *"     # Alternative: Every 3 hours
```

### Multiple Profile Support

To update multiple profiles:

1. Modify the `updateReadme.ts` file to support multiple destinations
2. Add additional repository secrets for different profiles
3. Update the workflow file to include matrix strategy for multiple targets

### Self-Hosted Runners

For advanced control, you can use self-hosted runners:

1. Set up a self-hosted GitHub Actions runner
2. Modify the workflow file to use your custom runner:

```yaml
jobs:
  preflight:
    runs-on: self-hosted # Instead of ubuntu-latest
```

### Containerized Deployment

The application can be containerized for consistent execution:

```Dockerfile
FROM oven/bun:latest

WORKDIR /app
COPY . .
RUN bun install --frozen-lockfile

CMD ["bun", "run", "src/weather-update/index.ts"]
```

---

<div style="text-align: center;">
  <p><strong>Profile Weather View</strong> | Deployment Guide</p>
  <p>
    <small>For more information, visit the project repository or open an issue.</small>
  </p>
</div>
