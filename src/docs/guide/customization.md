<div align="center">
  <h1>Customizing Your Weather Display</h1>
</div>

<br>

<div align="center" style="display: flex; justify-content: center; gap: 5px; flex-wrap: wrap;">
  <img src="https://img.shields.io/badge/Customization-Guide-blue" alt="Customization">
  <img src="https://img.shields.io/badge/Display-Options-green" alt="Display Options">
  <img src="https://img.shields.io/badge/Location-Settings-orange" alt="Location">
</div>

## Table of Contents

- [Overview](#overview)
- [Weather Display Format](#weather-display-format)
  - [Simple Table Format](#simple-table-format)
  - [Enhanced Card Format](#enhanced-card-format)
  - [Compact Badge Format](#compact-badge-format)
- [Location Settings](#location-settings)
  - [Changing Location Coordinates](#changing-location-coordinates)
  - [Using Multiple Locations](#using-multiple-locations)
- [Display Customization](#display-customization)
  - [Changing Icons](#changing-icons)
  - [Modifying Colors](#modifying-colors)
  - [Adjusting Layout](#adjusting-layout)
- [Custom Templates](#custom-templates)
- [Advanced Customizations](#advanced-customizations)

## Overview

Profile Weather View is designed to be highly customizable, allowing you to personalize how weather information appears on your GitHub profile. This guide covers the various ways to modify the weather display to match your profile's style and preferences.

## Weather Display Format

The application comes with several built-in formats that you can use or modify to suit your needs.

### Simple Table Format

The default format is a clean, tabular display that shows the essential weather information:

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

Which renders as:

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

### Enhanced Card Format

For a more visually appealing display, you can use a card-based format:

```html
<!-- Hourly Weather Update -->
<div align="center">
  <img src="https://openweathermap.org/img/w/03d.png" width="60" alt="" />
  <h3>Currently 30°C in Dhaka</h3>
  <h4>Cloudy with 60% humidity</h4>
  <p>☀️ Sunrise: 06:18 AM | 🌙 Sunset: 06:02 PM</p>
</div>
<!-- End of Hourly Weather Update -->
```

### Compact Badge Format

If you prefer a minimal look, consider a badge-style format:

```html
<!-- Hourly Weather Update -->
<a href="#"
  ><img
    src="https://img.shields.io/badge/Dhaka-30%C2%B0C%20Cloudy-blue?style=flat-square&logo=openweathermap"
    alt="Weather in Dhaka"
/></a>
<!-- End of Hourly Weather Update -->
```

## Location Settings

### Changing Location Coordinates

To change the location for which weather data is displayed, modify the `LAT` and `LON` constants in `src/services/fetchWeather.ts`:

```typescript
// Current location constants (Uttara, Dhaka)
const LAT = '23.8759';
const LON = '90.3795';

// Change to your desired location, for example, New York:
// const LAT = '40.7128';
// const LON = '-74.0060';
```

You can find coordinates for any location using services like:

- [LatLong.net](https://www.latlong.net/)
- [Google Maps](https://www.google.com/maps) (right-click on a location and select "What's here?")

### Using Multiple Locations

If you want to display weather for multiple locations, you can modify the `updateReadme.ts` file to include multiple weather sections:

```typescript
// Example modification for multiple locations
function updateReadme(
  primaryWeatherData: string,
  secondaryWeatherData: string,
): void {
  // Parse primary location data
  const [
    primaryDescription,
    primaryTemp,
    primarySunrise,
    primarySunset,
    primaryHumidity,
    primaryIcon,
  ] = primaryWeatherData.split('|');

  // Parse secondary location data
  const [
    secondaryDescription,
    secondaryTemp,
    secondarySunrise,
    secondarySunset,
    secondaryHumidity,
    secondaryIcon,
  ] = secondaryWeatherData.split('|');

  // Create primary location HTML
  // ...

  // Create secondary location HTML
  // ...

  // Update README with both sections
  // ...
}
```

## Display Customization

### Changing Icons

The default implementation uses OpenWeather's icon set, but you can use any icon set:

1. **OpenWeather Icons** (default): `https://openweathermap.org/img/w/${icon}.png`
2. **Custom Emoji**: Replace the `<img>` tag with emoji like `🌤️`, `☀️`, `🌧️`, etc.
3. **Font Awesome**: Integrate Font Awesome icons for a more stylized look

Example with emoji:

```html
<!-- Hourly Weather Update -->
<td align="center">Cloudy ☁️</td>
<!-- End of Hourly Weather Update -->
```

### Modifying Colors

You can customize colors using HTML/CSS inline styles:

```html
<!-- Hourly Weather Update -->
<td align="center" style="background-color: #e6f7ff; color: #0066cc">
  Cloudy
  <img width="15" src="https://openweathermap.org/img/w/03d.png" alt="" />
</td>
<td align="center" style="background-color: #fff0f0; color: #cc0000">30°C</td>
<!-- End of Hourly Weather Update -->
```

### Adjusting Layout

The layout can be modified by changing the HTML structure in `updateReadme.ts`. For example, to create a horizontal layout:

```typescript
const weatherSection = `
<!-- Hourly Weather Update -->
<div style="display: flex; align-items: center; justify-content: center; gap: 20px;">
  <div>
    <img width="50" src="https://openweathermap.org/img/w/${icon}.png" alt="">
    <div>${description}</div>
  </div>
  <div>
    <div style="font-size: 24px; font-weight: bold;">${temperature}°C</div>
    <div>${humidity}% humidity</div>
  </div>
  <div>
    <div>🌅 ${sunrise}</div>
    <div>🌇 ${sunset}</div>
  </div>
</div>
<!-- End of Hourly Weather Update -->
`;
```

## Custom Templates

You can create your own custom templates by modifying the `updateReadme.ts` file. The key is to maintain the comment markers so the GitHub Action can find and replace the correct section:

```typescript
// The markers must remain consistent
const START_MARKER = '<!-- Hourly Weather Update -->';
const END_MARKER = '<!-- End of Hourly Weather Update -->';

// Your custom template between these markers
const weatherSection = `
${START_MARKER}
  <!-- Your custom HTML here -->
${END_MARKER}
`;
```

## Advanced Customizations

For more advanced customizations, you can modify the GitHub Action workflow file:

1. **Adjust Update Frequency**: Change the cron schedule in `.github/workflows/update-readme.yml`:

   ```yaml
   schedule:
     - cron: '17 */6 * * *' # Every 6 hours
   ```

2. **Add Custom Parameters**: Extend the workflow_dispatch inputs:

   ```yaml
   inputs:
     display_format:
       description: 'Weather display format to use'
       required: false
       default: 'table'
       type: choice
       options:
         - table
         - card
         - badge
   ```

3. **Implement Temperature Units Toggle**: Add a parameter to switch between Celsius and Fahrenheit:
   ```yaml
   inputs:
     temperature_unit:
       description: 'Temperature unit'
       required: false
       default: 'celsius'
       type: choice
       options:
         - celsius
         - fahrenheit
   ```

You would then modify the `fetchWeather.ts` file to respect these parameters:

```typescript
// Example modification for temperature units
const API_KEY = process.env.OPEN_WEATHER_KEY;
const UNIT =
  process.env.TEMPERATURE_UNIT === 'fahrenheit' ? 'imperial' : 'metric';

const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${LAT}&lon=${LON}&exclude=minutely,hourly,daily,alerts&appid=${API_KEY}&units=${UNIT}`;
```

---

<div align="center">
  <p>
    <strong>Profile Weather View</strong> | Customization Guide
  </p>
  <p>
    <small>Need more customization options? Open an issue or contribute to the project!</small>
  </p>
</div>
