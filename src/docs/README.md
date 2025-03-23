# Profile Weather View Documentation

<div align="center">
  <img src="https://img.shields.io/badge/Bun-Latest-F9AD00" alt="Bun">
  <img src="https://img.shields.io/badge/TypeScript-5.8.2-3178C6" alt="TypeScript">
  <img src="https://img.shields.io/badge/CI/CD-GitHub_Actions-2088FF" alt="GitHub Actions">
  <img src="https://img.shields.io/badge/Coverage-100%25-brightgreen" alt="Test Coverage">
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License">
</div>

<div align="center">
  <h3>Automated Weather Updates for Your GitHub Profile</h3>
  <p><em>Keep your GitHub profile README fresh with real-time weather data</em></p>
</div>

## Overview

Profile Weather View is a modern TypeScript utility that automatically fetches current weather data and updates your GitHub profile README. Built with Bun for exceptional performance, this tool leverages GitHub Actions to provide regular updates without manual intervention.

<div align="center">
  <img src="https://mermaid.ink/svg/pako:eNptkE1rwzAMhv-K0WmFbuTDLnUXHQZ7OLTdpYcNT0mF7YxYTktD_vtcZ9kY6EXoo_eRhLP2pC0hxP4SLd9Djz8jOSN7cnmR7w8v5_0n5J1hzRbfVHGCOjLQnl0g5Tqy7-kOPdQAFbSQYn-iZYBHGIMxD-7wFzE6VTOMjZI9OzR5cAZmVQvZtXTnqmk2DFXeVhkPL-Ni_0rLDy0ItQjyRJ5wfvTOBopjp9TEYkkCQmPsXQlLXNsMHCJETz-kdEsK0WGEvG6rUkBYqF3ByyjX5YG2PpAT7i1NNKt6KTrW5iOy-6QgRJsyJ0PoaBRRl2Gs_wA0WGpd" alt="Workflow Diagram" width="70%">
</div>

### Key Features

- **Automated Updates**: Scheduled via GitHub Actions every 8 hours
- **Real-Time Weather**: Integrates with OpenWeather API
- **Low Maintenance**: Set it up once and forget about it
- **Customizable Display**: Configure the weather information displayed on your profile
- **Type Safety**: Built with TypeScript for reliability
- **Modern Runtime**: Powered by Bun for speed and efficiency
- **Comprehensive Testing**: Thorough test coverage ensures reliability

## Documentation

This comprehensive documentation will guide you through every aspect of the Profile Weather View project, from installation to advanced customization.

### Table of Contents

| Section                                       | Description                                 |
|-----------------------------------------------|---------------------------------------------|
| [Getting Started](guide/introduction)         | Installation guide and basic usage          |
| [Architecture](guide/architecture.md)         | System design and component overview        |
| [API Reference](reference/api-reference.md)   | Detailed function and service documentation |
| [Configuration](reference/configuration.md)   | Configuration options and customization     |
| [Deployment](guide/deployment.md)             | GitHub Actions setup and deployment options |
| [Testing](guide/testing.md)                   | Testing strategy and execution              |
| [Contributing](../../.github/contributing.md) | Guidelines for contributing to the project  |
| [Troubleshooting](guide/troubleshooting.md)   | Common issues and solutions                 |

## Quick Start

For the impatient, here's how to get started in just a few steps:

```bash
# Clone the repository
git clone https://github.com/tashfiqul-islam/profile-weather-view.git
cd profile-weather-view

# Install dependencies
bun install

# Create .env file with your API key
echo "OPEN_WEATHER_KEY=your_api_key_here" > .env

# Run the application
bun start
```

For detailed setup instructions, check the [Getting Started](guide/introduction) guide.

## How It Works

Profile Weather View operates through a simple yet powerful workflow:

1. **Data Fetching**: Retrieves current weather conditions from OpenWeather API
2. **Data Processing**: Formats the weather data for display
3. **README Update**: Updates the specially marked section in your GitHub profile README
4. **Automated Execution**: Runs on a schedule via GitHub Actions

The result is a consistently updated weather display on your GitHub profile that looks like this:

<div align="center">
  <table>
    <thead>
      <tr>
        <th>Weather</th>
        <th>Temperature</th>
        <th>Sunrise</th>
        <th>Sunset</th>
        <th>Humidity</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td align="center">Cloudy <img width="15" src="https://openweathermap.org/img/w/03d.png" alt=""></td>
        <td align="center">30°C</td>
        <td align="center">06:18 AM</td>
        <td align="center">06:02 PM</td>
        <td align="center">60%</td>
      </tr>
    </tbody>
  </table>
  <small><em>Last refresh: Wednesday, March 06, 2025 12:00:00 UTC+6</em></small>
</div>

## Project Background

Profile Weather View was created to demonstrate the power of GitHub Actions for automating profile customization. By showing real-time weather data on your profile, you can:

- Make your GitHub profile more dynamic and interesting
- Showcase a practical application of GitHub Actions
- Demonstrate your technical skills to profile visitors
- Provide useful information to people viewing your profile

## Technology Stack

This project leverages several modern technologies:

- **Bun**: Fast JavaScript runtime and package manager
- **TypeScript**: Type-safe programming language
- **Zod**: Runtime validation for API responses
- **Vitest**: Next-generation testing framework
- **GitHub Actions**: CI/CD and automation
- **OpenWeather API**: Weather data provider
- **ESLint & Prettier**: Code quality tools

## License

This project is licensed under the MIT License—see the [LICENSE](../LICENSE) file for details.

## Support

If you encounter any issues or have questions, please check the [Troubleshooting](guide/troubleshooting.md) guide or open an issue on GitHub.

---

<div align="center">
  <p>
    <strong>Profile Weather View</strong> | Documentation Home
  </p>
  <p>
    <small>Created with ❤️ using Bun and TypeScript</small>
  </p>
</div>
