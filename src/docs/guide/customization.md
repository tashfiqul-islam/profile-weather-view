<div style="text-align: center;">
  <h1>Customizing Your Weather Display</h1>
</div>

<br>

<div style="text-align: center; display: flex; justify-content: center; gap: 5px; flex-wrap: wrap;">
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
<td style="text-align: center;">
  Cloudy
  <img
    style="width: 15px;"
    src="https://openweathermap.org/img/w/03d.png"
    alt=""
  />
</td>
<td style="text-align: center;">30°C</td>
<td style="text-align: center;">06:18:00</td>
<td style="text-align: center;">18:02:00</td>
<td style="text-align: center;">60%</td>
<!-- End of Hourly Weather Update -->
```

Which renders as:

<div style="text-align: center;">
  <table style="margin: 0 auto;">
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
        <td style="text-align: center;">Cloudy <img style="width: 15px;" src="https://openweathermap.org/img/w/03d.png" alt=""></td>
        <td style="text-align: center;">30°C</td>
        <td style="text-align: center;">06:18:00</td>
        <td style="text-align: center;">18:02:00</td>
        <td style="text-align: center;">60%</td>
      </tr>
    </tbody>
  </table>
  <small><em>Last refresh: Wednesday, March 23, 2025 12:00:00 (UTC+6)</em></small>
</div>

### Enhanced Card Format

For a more visually appealing display, you can use a card-based format:

```html
<!-- Hourly Weather Update -->
<div style="text-align: center;">
  <img
    src="https://openweathermap.org/img/w/03d.png"
    style="width: 60px;"
    alt=""
  />
  <h3>Currently, 30°C in Dhaka</h3>
  <h4>Cloudy with 60% humidity</h4>
  <p>☀️ Sunrise: 06:18:00 | 🌙 Sunset: 18:02:00</p>
</div>
<!-- End of Hourly Weather Update -->
```

### Compact Badge Format

If you prefer a minimal look, consider a badge-style format:

```html
<!-- Hourly Weather Update -->
<a href="#">
  <img
    src="https://img.shields.io/badge/Dhaka-30%C2%B0C%20Cloudy-blue?style=flat-square&logo=openweathermap"
    alt="Weather in Dhaka"
  />
</a>
<!-- End of Hourly Weather Update -->
```

## Location Settings

### Changing Location Coordinates

To change the location for which weather data is displayed,
modify the `LAT` and `LON` constants in `src/weather-update/services/fetchWeather.ts`:

```typescript
/**
 * ✅ OpenWeather API Constants
 * - Latitude and Longitude for Uttara, Dhaka.
 */
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

If you want to display weather for multiple locations,
you can extend the `updateReadme.ts` file in `src/weather-update/services/`.
Here's how you might implement this feature:

```typescript
/**
 * Updates the README file with weather data from multiple locations.
 * @param primaryWeatherData The formatted weather data string for primary location
 * @param secondaryWeatherData The formatted weather data string for secondary location
 * @param customReadmePath Optional path to a README file in a different location
 */
export async function updateReadmeMultiLocation(
  primaryWeatherData: string,
  secondaryWeatherData: string,
  customReadmePath?: string,
): Promise<boolean> {
  const readmePath = customReadmePath ?? join(process.cwd(), 'README.md');
  const readmeFile = Bun.file(readmePath);

  if (!(await readmeFile.exists())) {
    console.error(`❌ Error: README.md file not found at path: ${readmePath}`);
    return false;
  }

  // Parse primary location data
  const primarySegments = primaryWeatherData.split('|');
  if (primarySegments.length !== 6) {
    console.error('❌ Error: Invalid primary weather data format.');
    return false;
  }

  // Parse secondary location data
  const secondarySegments = secondaryWeatherData.split('|');
  if (secondarySegments.length !== 6) {
    console.error('❌ Error: Invalid secondary weather data format.');
    return false;
  }

  const [
    primaryDescription,
    primaryTemp,
    primarySunrise,
    primarySunset,
    primaryHumidity,
    primaryIcon,
  ] = primarySegments;
  const [
    secondaryDescription,
    secondaryTemp,
    secondarySunrise,
    secondarySunset,
    secondaryHumidity,
    secondaryIcon,
  ] = secondarySegments;

  // Create formatted weather sections for both locations
  // Implementation details...

  // Update README with both sections
  // Implementation details...

  return true;
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
<td style="text-align: center;">Cloudy ☁️</td>
<!-- End of Hourly Weather Update -->
```

### Modifying Colors

You can customize colors using HTML/CSS inline styles:

```html
<!-- Hourly Weather Update -->
<td style="text-align: center; background-color: #e6f7ff; color: #0066cc;">
  Cloudy
  <img
    style="width: 15px;"
    src="https://openweathermap.org/img/w/03d.png"
    alt=""
  />
</td>
<td style="text-align: center; background-color: #fff0f0; color: #cc0000;">
  30°C
</td>
<!-- End of Hourly Weather Update -->
```

### Adjusting Layout

The layout can be modified by changing the HTML structure in `src/weather-update/services/updateReadme.ts`.
For example, to create a horizontal layout:

```typescript
// Updated weather section to use a horizontal layout
const updatedWeatherData = `<!-- Hourly Weather Update -->
<div style="display: flex; align-items: center; justify-content: center; gap: 20px;">
  <div>
    <img style="width: 50px;" src="https://openweathermap.org/img/w/${icon}.png" alt="">
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
<!-- End of Hourly Weather Update -->`;
```

## Custom Templates

You can create your own custom templates by modifying the `src/weather-update/services/updateReadme.ts` file.
The key is to maintain the comment markers so the GitHub Action can find and replace the correct section:

```typescript
// The weather section regex pattern must match these markers
const weatherSectionRegex =
  /<!-- Hourly Weather Update -->[\s\S]*?<!-- End of Hourly Weather Update -->/;

// Your custom template using the same markers
const updatedWeatherData = `<!-- Hourly Weather Update -->
  <!-- Your custom HTML here -->
<!-- End of Hourly Weather Update -->`;
```

## Advanced Customizations

For more advanced customizations, you can modify the GitHub Action workflow file:

1. **Adjust Update Frequency**: Change the cron schedule in `.github/workflows/profile-weather-update.yml`:

   ```yaml
   schedule:
     # Strategic times that capture meaningful weather changes while conserving resources
     - cron: '23 5,13,21 * * *' # 3 times daily: morning (5:23), afternoon (13:23), evening (21:23)
   ```

2. **Add Custom Parameters**: Extend the workflow_dispatch inputs:

   ```yaml
   workflow_dispatch:
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
   workflow_dispatch:
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

You would then modify the `src/weather-update/services/fetchWeather.ts` file to respect these parameters:

```typescript
/**
 * 🌍 Fetches current weather data from OpenWeather API.
 */
export async function fetchWeatherData(): Promise<string> {
  const API_KEY = Bun.env['OPEN_WEATHER_KEY']?.trim();
  const UNIT =
    Bun.env['TEMPERATURE_UNIT'] === 'fahrenheit' ? 'imperial' : 'metric';

  if (!API_KEY) {
    console.error('❌ Missing required environment variable: OPEN_WEATHER_KEY');
    throw new Error(
      '❌ Missing required environment variable: OPEN_WEATHER_KEY',
    );
  }

  const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${LAT}&lon=${LON}&exclude=minutely,hourly,daily,alerts&appid=${API_KEY}&units=${UNIT}`;

  // Rest of the function...
}
```

---

<div style="text-align: center;">
  <p>
    <strong>Profile Weather View</strong> | Customization Guide
  </p>
  <p>
    <small>Need more customization options? Open an issue or contribute to the project!</small>
  </p>
</div>
