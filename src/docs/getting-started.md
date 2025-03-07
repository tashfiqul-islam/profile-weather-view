# Getting Started

<div align="center">
  <img src="https://img.shields.io/badge/Bun-latest-F9AD00" alt="Bun Version">
  <img src="https://img.shields.io/badge/TypeScript-5.8.2-3178C6" alt="TypeScript Version">
  <img src="https://img.shields.io/badge/API-OpenWeather-EB6E4B" alt="API">
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License">
</div>

<div align="center">
  <p><em>Welcome to Profile Weather View, a utility that updates your GitHub profile README with current weather data.</em></p>
</div>

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Development](#development)
- [Available Commands](#available-commands)
- [Troubleshooting](#troubleshooting)
- [Next Steps](#next-steps)

## Prerequisites

Before you begin, ensure you have the following installed:

- **[Bun](https://bun.sh/)** (latest version) - Fast JavaScript runtime & package manager

  ```bash
  # Install Bun on macOS, Linux, or WSL
  curl -fsSL https://bun.sh/install | bash

  # Verify installation
  bun --version
  ```

- **OpenWeather API Key** - Required for weather data access

  1. Sign up at [OpenWeather](https://openweathermap.org/api)
  2. Navigate to your API keys section
  3. Create or copy your API key

- **Git** - For repository management

## Installation

Follow these steps to set up the project locally:

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/profile-weather-view.git
   cd profile-weather-view
   ```

2. **Install dependencies**

   ```bash
   bun install
   ```

   This will install all required dependencies and set up Git hooks through Husky.

## Configuration

1. **Create environment file**

   Create a `.env` file in the project root directory:

   ```bash
   touch .env
   ```

2. **Add your API key**

   Open the `.env` file and add your OpenWeather API key:

   ```
   OPEN_WEATHER_KEY=your_api_key_here
   ```

3. **Configure location (Optional)**

   By default, the application fetches weather for Uttara, Dhaka (23.8759°N, 90.3795°E).

   To change the location, modify the `LAT` and `LON` constants in `src/services/fetchWeather.ts`.

## Usage

### Basic Usage

Run the application to fetch current weather data and update your README:

```bash
bun start
```

The application will:

1. Fetch current weather from OpenWeather API
2. Parse and format the weather data
3. Update the README.md file in your repository
4. Display a success message when complete

### Expected Output

When successful, you'll see output similar to:

```
🌍 Fetching weather data from OpenWeather API...
🌅 Raw Sunrise (UTC): 1710000000
🌇 Raw Sunset (UTC): 1710050000
🕒 Converted Sunrise (Dhaka): 06:18:20
🕒 Converted Sunset (Dhaka): 06:02:40
✅ README updated successfully.
```

### Weather Section Format

The application will update a specially marked section in your README with weather data:

```html
<!-- Hourly Weather Update -->
<td align="center">
  Cloudy
  <img width="15" src="https://openweathermap.org/img/w/03d.png" alt="" />
</td>
<td align="center">30°C</td>
<td align="center">06:18 AM</td>
<td align="center">06:02 PM</td>
<td align="center">60%</td>
<!-- End of Hourly Weather Update -->
```

## Development

### Development Mode

Run the application in development mode for faster iteration:

```bash
bun run dev
```

This runs the application without the build step, using Bun's built-in TypeScript loader.

### Workflow

1. Make changes to the source code
2. Run in development mode to test changes
3. Check code quality with `bun run check-all`
4. Commit changes (this will trigger pre-commit hooks)

### Hot Tips

- Use `// @ts-expect-error` or `// @ts-ignore` sparingly when needed
- Create tests for new functionality in the `src/__tests__` directory
- Update documentation when adding new features

## Available Commands

| Command                 | Description                                 |
| ----------------------- | ------------------------------------------- |
| `bun start`             | Build and run the application               |
| `bun run dev`           | Run in development mode                     |
| `bun run lint`          | Run ESLint to check code quality            |
| `bun run format`        | Format code with Prettier                   |
| `bun run test`          | Run tests with Vitest                       |
| `bun run test:watch`    | Run tests in watch mode                     |
| `bun run test:coverage` | Run tests with coverage report              |
| `bun run type-check`    | Check TypeScript types                      |
| `bun run check-all`     | Run all checks (tests, types, lint, format) |
| `bun run commit`        | Create a conventional commit                |

## Troubleshooting

### Common Issues

- **Missing API Key Error**

  ```
  ❌ Missing required environment variable: OPEN_WEATHER_KEY
  ```

  **Solution**: Ensure your `.env` file exists and contains a valid API key.

- **Weather Data Fetch Failed**

  ```
  ❌ Weather data fetch failed. Check logs for details.
  ```

  **Solution**: Verify internet connection and API key validity. Check if the OpenWeather API is accessible.

- **Bun Command Not Found**

  ```
  command not found: bun
  ```

  **Solution**: Ensure Bun is installed correctly. Add it to your PATH if necessary.

### Getting Help

If you encounter issues not covered here:

1. Check the [troubleshooting documentation](./troubleshooting.md)
2. Open an issue on GitHub with detailed steps to reproduce
3. Include error logs and environment information

## Next Steps

Now that you've set up Profile Weather View, you might want to:

- [Customize the weather display format](./configuration.md)
- [Set up automated updates with GitHub Actions](./deployment.md)
- [Contribute to the project](./contributing.md)
- [Explore the API reference](./api-reference.md)

---

<div align="center">
  <p>
    <strong>Profile Weather View</strong> | Made with ❤️ using Bun and TypeScript
  </p>
  <p>
    <small>For more information, see the <a href="./README.md">documentation home</a>.</small>
  </p>
</div>
