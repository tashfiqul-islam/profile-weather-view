<div style="text-align: center;">
  <h1>Theme Integration Guide</h1>
</div>

<br>

<div style="text-align: center; display: flex; justify-content: center; gap: 5px; flex-wrap: wrap;">
  <Badge type="info" text="Theme - Integration"></Badge>
  <Badge type="tip" text="Dark Mode Support"></Badge>
  <Badge type="warning" text="GitHub Themes"></Badge>
</div>

## Table of Contents

1. [Table of Contents](#table-of-contents)
2. [Overview](#overview)
3. [Theme-Aware Displays](#theme-aware-displays)
   1. [Dark/Light Mode Detection](#darklight-mode-detection)
   2. [Theme-Responsive Tables](#theme-responsive-tables)
4. [GitHub Profile Themes](#github-profile-themes)
   1. [Popular Theme Integration](#popular-theme-integration)
      1. [Minimalist Theme](#minimalist-theme)
      2. [Badges Theme](#badges-theme)
      3. [Modern Theme](#modern-theme)
   2. [Custom Theme Examples](#custom-theme-examples)
      1. [Card-Based Theme](#card-based-theme)
      2. [Compact Inline Theme](#compact-inline-theme)
5. [CSS Styling Techniques](#css-styling-techniques)
   1. [GitHub-Safe Inline Styles](#github-safe-inline-styles)
   2. [Using HTML Attributes](#using-html-attributes)
6. [Advanced Integration](#advanced-integration)
   1. [SVG-Based Weather Display](#svg-based-weather-display)
   2. [Image-Only Display](#image-only-display)
7. [Theme Templates](#theme-templates)
   1. [Modern Dark/Light Template](#modern-darklight-template)
   2. [Minimal Badge Template](#minimal-badge-template)
   3. [Fancy Card Template](#fancy-card-template)

## Overview

This guide will help you integrate the weather display from Profile Weather View seamlessly
with your GitHub profile's visual theme.
Whether you're using a custom theme, dark mode,
or any popular GitHub profile theme, these techniques will ensure your weather display
looks cohesive and professional.

## Theme-Aware Displays

GitHub profile README supports both light and dark themes, following the user's personal
GitHub theme preference.
Creating theme-aware weather displays ensures your profile looks
great regardless of which theme the visitor is using.

### Dark/Light Mode Detection

GitHub supports the `prefers-color-scheme` media query via the `<picture>` element, allowing
you to provide different images based on the user's theme:

```html
<!-- Hourly Weather Update -->
<div style="text-align: center;">
  <h3>Current Weather in Dhaka</h3>
  <table>
    <tr>
      <th>Weather</th>
      <th>Temperature</th>
      <th>Humidity</th>
    </tr>
    <tr>
      <td style="text-align: center;">
        <picture>
          <source
            media="(prefers-color-scheme: dark)"
            src="https://openweathermap.org/img/wn/01n@2x.png"
            srcset=""
          />
          <source
            media="(prefers-color-scheme: light)"
            src="https://openweathermap.org/img/wn/01d@2x.png"
            srcset=""
          />
          <img
            alt="Weather icon"
            src="https://openweathermap.org/img/wn/01d@2x.png"
            style="width: 30px;"
          />
        </picture>
        <br />
        Clear
      </td>
      <td style="text-align: center;">30°C</td>
      <td style="text-align: center;">60%</td>
    </tr>
  </table>
</div>
<!-- End of Hourly Weather Update -->
```

### Theme-Responsive Tables

For a more sophisticated approach, you can style your table to respond to GitHub's theme:

```html
<!-- Hourly Weather Update -->
<div style="text-align: center;">
  <table>
    <thead>
      <tr>
        <th style="text-align: center;">Weather</th>
        <th style="text-align: center;">Temperature</th>
        <th style="text-align: center;">Sunrise</th>
        <th style="text-align: center;">Sunset</th>
        <th style="text-align: center;">Humidity</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="text-align: center;">
          <picture>
            <source
              media="(prefers-color-scheme: dark)"
              src="https://openweathermap.org/img/wn/03n@2x.png"
              srcset=""
            />
            <source
              media="(prefers-color-scheme: light)"
              src="https://openweathermap.org/img/wn/03d@2x.png"
              srcset=""
            />
            <img
              alt="Cloudy"
              src="https://openweathermap.org/img/wn/03d@2x.png"
              style="width: 30px;"
            />
          </picture>
          <br />
          Cloudy
        </td>
        <td style="text-align: center;">30°C</td>
        <td style="text-align: center;">06:18:00</td>
        <td style="text-align: center;">18:02:00</td>
        <td style="text-align: center;">60%</td>
      </tr>
    </tbody>
  </table>
  <p><em>Last refresh: Wednesday, March 08, 2025 12:00:00 (UTC+6)</em></p>
</div>
<!-- End of Hourly Weather Update -->
```

## GitHub Profile Themes

Many GitHub users implement custom themes for their profile README.
Here's how to
integrate weather data with common themes.

### Popular Theme Integration

#### Minimalist Theme

```html
<!-- Hourly Weather Update -->
<details>
  <summary>📌 Current Weather</summary>
  <br />
  <div style="text-align: center;">
    <img
      src="https://openweathermap.org/img/wn/01d@2x.png"
      style="width: 40px;"
      alt=""
    />
    <h3>30°C | Clear</h3>
    <h4>Dhaka, Bangladesh</h4>
    <p>Sunrise: 06:18:00 | Sunset: 18:02:00 | Humidity: 60%</p>
  </div>
</details>
<!-- End of Hourly Weather Update -->
```

#### Badges Theme

```html
<!-- Hourly Weather Update -->
<p>
  <img
    src="https://img.shields.io/badge/Weather-Cloudy-lightblue?style=flat-square&logo=openweathermap"
    alt="Weather"
  />
  <img
    src="https://img.shields.io/badge/Temperature-30°C-orange?style=flat-square&logo=thermometer"
    alt="Temperature"
  />
  <img
    src="https://img.shields.io/badge/Humidity-60%25-blue?style=flat-square&logo=water"
    alt="Humidity"
  />
  <img
    src="https://img.shields.io/badge/Updated-08--Mar--2025-green?style=flat-square&logo=clockify"
    alt="Updated"
  />
</p>
<!-- End of Hourly Weather Update -->
```

#### Modern Theme

```html
<!-- Hourly Weather Update -->
<div style="text-align: center;">
  <img
    src="https://openweathermap.org/img/wn/01d@4x.png"
    style="width: 100px;"
    alt=""
  />
  <h2>30°C | Dhaka</h2>
  <table>
    <tr>
      <td style="text-align: center;"><b>Sunrise</b></td>
      <td style="text-align: center;"><b>Sunset</b></td>
      <td style="text-align: center;"><b>Humidity</b></td>
    </tr>
    <tr>
      <td style="text-align: center;">06:18:00</td>
      <td style="text-align: center;">18:02:00</td>
      <td style="text-align: center;">60%</td>
    </tr>
  </table>
</div>
<!-- End of Hourly Weather Update -->
```

### Custom Theme Examples

#### Card-Based Theme

```html
<!-- Hourly Weather Update -->
<table>
  <tr>
    <td>
      <div style="text-align: center;">
        <h3>Dhaka Weather</h3>
        <img
          src="https://openweathermap.org/img/wn/02d@2x.png"
          style="width: 40px;"
          alt=""
        /><br />
        <b>Few Clouds</b><br />
        Temperature: 30°C<br />
        Humidity: 60%<br />
        <sub><em>Last updated: March 08, 2025</em></sub>
      </div>
    </td>
    <td>
      <div style="text-align: center;">
        <h3>Day Cycle</h3>
        🌅 Sunrise: 06:18:00<br />
        🌇 Sunset: 18:02:00<br />
        ⏱️ Day Length: 11h 44m<br />
        <sub><em>Timezone: Asia/Dhaka</em></sub>
      </div>
    </td>
  </tr>
</table>
<!-- End of Hourly Weather Update -->
```

#### Compact Inline Theme

```html
<!-- Hourly Weather Update -->
<div style="text-align: center;">
  <span title="Current Weather in Dhaka">
    <img
      src="https://openweathermap.org/img/wn/01d.png"
      style="width: 20px; vertical-align: bottom;"
      alt=""
    />
    30°C <sup>☀️6:18:00</sup>/<sub>🌙18:02:00</sub>
    <code>60%💧</code>
  </span>
</div>
<!-- End of Hourly Weather Update -->
```

## CSS Styling Techniques

While GitHub README files have limitations with CSS, there are still several techniques
you can use to style your weather display.

### GitHub-Safe Inline Styles

GitHub supports a limited set of inline style attributes. Here are safe ones to use:

```html
<!-- Hourly Weather Update -->
<div style="text-align: center;">
  <table>
    <tr>
      <th style="text-align: center; width: 150px;">Weather</th>
      <th style="text-align: center; width: 120px;">Temperature</th>
      <th style="text-align: center; width: 120px;">Humidity</th>
    </tr>
    <tr>
      <td style="text-align: center;">
        <img
          src="https://openweathermap.org/img/wn/01d@2x.png"
          style="width: 50px; height: 50px;"
          alt=""
        /><br />
        <span>Clear</span>
      </td>
      <td style="text-align: center;"><b>30°C</b></td>
      <td style="text-align: center;"><b>60%</b></td>
    </tr>
  </table>
</div>
<!-- End of Hourly Weather Update -->
```

### Using HTML Attributes

Modern alternatives to HTML presentation attributes:

```html
<!-- Hourly Weather Update -->
<table style="text-align: center; width: 80%; margin: 0 auto;">
  <tr>
    <th style="text-align: center; background-color: #f6f8fa; width: 20%;">
      Weather
    </th>
    <th style="text-align: center; background-color: #f6f8fa; width: 20%;">
      Temperature
    </th>
    <th style="text-align: center; background-color: #f6f8fa; width: 20%;">
      Humidity
    </th>
    <th style="text-align: center; background-color: #f6f8fa; width: 20%;">
      Sunrise
    </th>
    <th style="text-align: center; background-color: #f6f8fa; width: 20%;">
      Sunset
    </th>
  </tr>
  <tr>
    <td style="text-align: center; vertical-align: middle;">
      <img
        src="https://openweathermap.org/img/wn/02d.png"
        style="width: 30px;"
        alt=""
      /><br />
      Few Clouds
    </td>
    <td style="text-align: center; vertical-align: middle; color: #e63946;">
      30°C
    </td>
    <td style="text-align: center; vertical-align: middle; color: #457b9d;">
      60%
    </td>
    <td style="text-align: center; vertical-align: middle; color: #f77f00;">
      06:18:00
    </td>
    <td style="text-align: center; vertical-align: middle; color: #023e8a;">
      18:02:00
    </td>
  </tr>
</table>
<!-- End of Hourly Weather Update -->
```

## Advanced Integration

### SVG-Based Weather Display

For full control over appearance, you can use inline SVG:

```html
<!-- Hourly Weather Update -->
<svg width="360" height="120" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="360" height="120" rx="10" fill="#f8f9fa" />

  <!-- Weather Icon -->
  <circle cx="60" cy="60" r="30" fill="#ffd166" />
  <circle cx="60" cy="60" r="20" fill="#ffd166" />

  <!-- Temperature -->
  <text
    x="130"
    y="50"
    font-family="Arial"
    font-size="24"
    font-weight="bold"
    fill="#e63946"
  >
    30°C
  </text>
  <text x="130" y="75" font-family="Arial" font-size="16" fill="#555">
    Sunny
  </text>

  <!-- Humidity -->
  <text x="240" y="50" font-family="Arial" font-size="16" fill="#555">
    Humidity
  </text>
  <text
    x="250"
    y="75"
    font-family="Arial"
    font-size="20"
    font-weight="bold"
    fill="#457b9d"
  >
    60%
  </text>

  <!-- Timestamp -->
  <text
    x="180"
    y="110"
    font-family="Arial"
    font-size="10"
    fill="#666"
    text-anchor="middle"
  >
    Last updated: March 08, 2025
  </text>
</svg>
<!-- End of Hourly Weather Update -->
```

### Image-Only Display

For the simplest integration that works with any theme:

```html
<!-- Hourly Weather Update -->
<p style="text-align: center;">
  <a href="https://openweathermap.org">
    <img
      src="https://img.shields.io/badge/Dhaka-30°C_|_Cloudy_|_60%_humidity-informational?style=for-the-badge&logo=openweathermap&logoColor=white"
      alt="Weather data for Dhaka"
    />
  </a>
</p>
<!-- End of Hourly Weather Update -->
```

## Theme Templates

Below are complete, ready-to-use templates you can copy directly into your updateReadme.ts file:

### Modern Dark/Light Template

```typescript
// In updateReadme.ts
const updatedWeatherData = `
<!-- Hourly Weather Update -->
<div style="text-align: center;">
  <h3>Current Weather in ${location}</h3>
  <div>
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://openweathermap.org/img/wn/${icon}@2x.png">
      <source media="(prefers-color-scheme: light)" srcset="https://openweathermap.org/img/wn/${icon}@2x.png">
      <img alt="${description}" src="https://openweathermap.org/img/wn/${icon}@2x.png" style="width: 100px;">
    </picture>
  </div>
  <table>
    <tr>
      <td style="text-align: center; width: 200px;"><b>Condition</b></td>
      <td style="text-align: center; width: 150px;"><b>Temperature</b></td>
      <td style="text-align: center; width: 150px;"><b>Humidity</b></td>
    </tr>
    <tr>
      <td style="text-align: center;">${description}</td>
      <td style="text-align: center;">${temperature}°C</td>
      <td style="text-align: center;">${humidity}%</td>
    </tr>
  </table>
  <table>
    <tr>
      <td style="text-align: center; width: 200px;"><b>Sunrise</b></td>
      <td style="text-align: center; width: 200px;"><b>Sunset</b></td>
    </tr>
    <tr>
      <td style="text-align: center;">${sunrise}</td>
      <td style="text-align: center;">${sunset}</td>
    </tr>
  </table>
  <p><em>Last refresh: ${lastRefreshTime}</em></p>
</div>
<!-- End of Hourly Weather Update -->
`;
```

### Minimal Badge Template

```typescript
// In updateReadme.ts
const updatedWeatherData = `
<!-- Hourly Weather Update -->
<p style="text-align: center;">
  <img src="https://img.shields.io/badge/Weather-${encodeURIComponent(description)}-informational?style=flat-square&logo=openweathermap" alt="Weather">
  <img src="https://img.shields.io/badge/Temperature-${encodeURIComponent(temperature)}°C-orange?style=flat-square" alt="Temperature">
  <img src="https://img.shields.io/badge/Humidity-${encodeURIComponent(humidity)}%25-blue?style=flat-square" alt="Humidity">
  <img src="https://img.shields.io/badge/Updated-${encodeURIComponent(lastRefreshTime.replace(/\s/g, '_'))}-green?style=flat-square" alt="Updated">
</p>
<!-- End of Hourly Weather Update -->
`;
```

### Fancy Card Template

```typescript
// In updateReadme.ts
const updatedWeatherData = `
<!-- Hourly Weather Update -->
<div style="text-align: center;">
  <table>
    <tr>
      <td style="text-align: center;">
        <h3>☀️ Weather in Dhaka</h3>
        <img src="https://openweathermap.org/img/wn/${icon}@4x.png" style="width: 100px;"><br>
        <h2>${temperature}°C | ${description}</h2>
        <table>
          <tr>
            <td style="text-align: center;"><b>🌅 Sunrise</b></td>
            <td style="text-align: center;"><b>🌇 Sunset</b></td>
            <td style="text-align: center;"><b>💧 Humidity</b></td>
          </tr>
          <tr>
            <td style="text-align: center;">${sunrise}</td>
            <td style="text-align: center;">${sunset}</td>
            <td style="text-align: center;">${humidity}%</td>
          </tr>
        </table>
        <p><sub><em>Last updated: ${lastRefreshTime}</em></sub></p>
      </td>
    </tr>
  </table>
</div>
<!-- End of Hourly Weather Update -->
`;
```

---

<div style="text-align: center;">
  <p>
    <strong>Profile Weather View</strong> | Theme Integration Guide
  </p>
  <p>
    <small>Need help with custom theme integration? Open an issue in the repository!</small>
  </p>
</div>
