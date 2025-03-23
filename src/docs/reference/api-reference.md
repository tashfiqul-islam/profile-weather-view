<div style="text-align: center;">
  <h1>API Reference</h1>
</div>

<br>

<div style="text-align: center; display: flex; justify-content: center; gap: 5px; flex-wrap: wrap;">
  <img src="https://img.shields.io/badge/TypeScript-v5.8.2-blue" alt="TypeScript Version">
  <img src="https://img.shields.io/badge/Bun-latest-important" alt="Bun Version">
  <img src="https://img.shields.io/badge/Documentation-Comprehensive-success" alt="Documentation Status">
</div>

## Table of Contents

- [Overview](#overview)
- [Services](#services)
  - [fetchWeather.ts](#fetchweatherts)
  - [updateReadme.ts](#updatereadmets)
- [Utilities](#utilities)
  - [preload.ts](#preloadts)
- [Type Definitions](#type-definitions)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)

## Overview

This API reference documents the core functionality of the Profile Weather View application.
Each function is thoroughly documented with its parameters, return values, error handling,
and usage examples.

## Services

The services directory contains the core business logic of the application.

### fetchWeather.ts

The weather fetching service responsible for retrieving data from the OpenWeather API.

#### Constants

| Name  | Type     | Description                           |
| ----- | -------- | ------------------------------------- |
| `LAT` | `string` | Latitude for Uttara, Dhaka (23.8759)  |
| `LON` | `string` | Longitude for Uttara, Dhaka (90.3795) |

#### Types

```typescript
export type WeatherData = z.infer<typeof WeatherSchema>;
```

The `WeatherData` type is inferred from the Zod schema that validates the OpenWeather API response.

#### `fetchWeatherData()`

Fetches current weather data from the OpenWeather API and formats it as a string.

**Signature and Implementation:**

```typescript
export async function fetchWeatherData(): Promise<string> {
  const API_KEY = Bun.env['OPEN_WEATHER_KEY']?.trim();

  if (!API_KEY) {
    console.error('❌ Missing required environment variable: OPEN_WEATHER_KEY');
    throw new Error(
      '❌ Missing required environment variable: OPEN_WEATHER_KEY',
    );
  }

  const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${LAT}&lon=${LON}&exclude=minutely,hourly,daily,alerts&appid=${API_KEY}&units=metric`;

  console.warn('🌍 Fetching weather data from OpenWeather API...');

  try {
    const response: Response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `❌ HTTP Error ${response.status}: ${response.statusText}`,
      );
    }

    const rawData: unknown = await response.json();
    const data: WeatherData = WeatherSchema.parse(rawData);

    const { humidity, sunrise, sunset, temp, weather } = data.current;

    const roundedTemperature = Math.round(temp);
    const sunriseTime = convertToDhakaTime(sunrise);
    const sunsetTime = convertToDhakaTime(sunset);
    const weatherDescription = weather[0].main ?? 'Unknown';
    const iconCode = weather[0].icon ?? '01d';

    return `${weatherDescription}|${roundedTemperature}|${sunriseTime}|${sunsetTime}|${humidity}|${iconCode}`;
  } catch (error) {
    console.error('❌ Weather data fetch failed:', error);
    throw new Error('❌ Weather data fetch failed. Check logs for details.');
  }
}
```

**Returns:**

- `Promise<string>` - A pipe-delimited string with the format:  
  `"weatherDescription|temperature|sunriseTime|sunsetTime|humidity|iconCode"`

**Throws:**

- `Error` - If the OpenWeather API key is missing
- `Error` - If the API request fails
- `Error` - If the response format is invalid

**Implementation Details:**

1. Verifies the API key exists in environment variables
2. Constructs the API URL with latitude, longitude, and API key
3. Makes the request to the OpenWeather API
4. Validates the response format using Zod schema
5. Processes and formats the weather data
6. Returns the formatted string

**Example:**

```typescript
try {
  const weatherData = await fetchWeatherData();
  console.warn('✅ Weather data fetched successfully:', weatherData);
  // "Cloudy|30|06:18:00|18:02:00|60|03d"
} catch (error) {
  console.error('❌ Weather data fetch failed:', error);
}
```

#### `convertToDhakaTime(utcSeconds: number)`

Converts a UTC timestamp to Dhaka time (UTC+6) using the Temporal API.

**Signature and Implementation:**

```typescript
export function convertToDhakaTime(utcSeconds: number): string {
  return Temporal.Instant.fromEpochSeconds(utcSeconds)
    .toZonedDateTimeISO('Asia/Dhaka')
    .toPlainTime()
    .toString()
    .replace(/\.\d+/, ''); // HH:MM:SS format
}
```

**Parameters:**

- `utcSeconds` (`number`) - UTC timestamp in seconds

**Returns:**

- `string` - Time formatted as "HH:MM:SS" in Dhaka timezone (UTC+6)

**Implementation Details:**

1. Converts the UTC seconds to a Temporal Instant
2. Converts to Dhaka timezone using 'Asia/Dhaka'
3. Formats as a plain time string
4. Removes fractional seconds to ensure HH:MM:SS format

**Example:**

```typescript
const dhakaTime = convertToDhakaTime(1710000000);
console.warn(dhakaTime); // "06:18:20"
```

### updateReadme.ts

The service responsible for updating the GitHub profile README with weather data.

#### `updateReadme(weatherData: string, customReadmePath?: string)`

Updates the README file with new weather data by replacing a specially marked section.

**Signature and Implementation:**

```typescript
export async function updateReadme(
  weatherData: string,
  customReadmePath?: string,
): Promise<boolean> {
  const readmePath = customReadmePath ?? join(process.cwd(), 'README.md');
  const readmeFile = Bun.file(readmePath);

  if (!(await readmeFile.exists())) {
    console.error(`❌ Error: README.md file not found at path: ${readmePath}`);
    return false;
  }

  const weatherSegments = weatherData.split('|');
  if (weatherSegments.length !== 6) {
    console.error(
      '❌ Error: Invalid weather data format. Expected 6 segments.',
    );
    return false;
  }

  const [description, temperature, sunrise, sunset, humidity, icon] =
    weatherSegments;

  const formattedTime = new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
    month: 'long',
    second: '2-digit',
    timeZone: 'Asia/Dhaka',
    weekday: 'long',
    year: 'numeric',
  }).format(new Date());

  const lastRefreshTime = `${formattedTime} (UTC+6)`;

  // Updated weather section to match the README format
  const updatedWeatherData = `<!-- Hourly Weather Update -->
        <td style="text-align: center;">${description} <img style="width: 15px;" src="https://openweathermap.org/img/w/${icon}.png" alt=""></td>
        <td style="text-align: center;">${temperature}°C</td>
        <td style="text-align: center;">${sunrise}</td>
        <td style="text-align: center;">${sunset}</td>
        <td style="text-align: center;">${humidity}%</td>
        <!-- End of Hourly Weather Update -->`;

  const readmeContent = await readmeFile.text();
  const oldContent = readmeContent;

  const weatherSectionRegex =
    /<!-- Hourly Weather Update -->[\s\S]*?<!-- End of Hourly Weather Update -->/;

  if (!weatherSectionRegex.test(readmeContent)) {
    console.warn(
      '⚠️ Warning: Weather section not found in README. Skipping update.',
    );
    return false;
  }

  const updatedContent = readmeContent.replace(
    weatherSectionRegex,
    updatedWeatherData,
  );

  // Update the last refresh time separately
  const updatedWithRefreshTime = updatedContent.replace(
    /<em>Last refresh:.*?<\/em>/,
    `<em>Last refresh: ${lastRefreshTime}</em>`,
  );

  // Check if there are actually any changes to make
  if (updatedWithRefreshTime === oldContent) {
    console.warn('ℹ️ No changes needed to README.');
    return false;
  }

  try {
    // Use Bun's write API
    await Bun.write(readmePath, updatedWithRefreshTime);
    console.warn(`✅ README updated successfully at: ${readmePath}`);
    return true;
  } catch (error) {
    console.error('❌ Error writing to README file:', error);
    return false;
  }
}
```

**Parameters:**

- `weatherData` (`string`) - Formatted weather data with pipe-delimited values in the format:  
  `"description|temperature|sunrise|sunset|humidity|icon"`
- `customReadmePath` (`string?`) - Optional path to a README file in a different location

**Returns:**

- `Promise<boolean>` - `true` if README was updated successfully, `false` otherwise

**Implementation Details:**

1. Read the README.md file from the specified path or project root
2. Parses the pipe-delimited weather data into components
3. Gets the current time formatted for display
4. Constructs the new weather section in HTML format
5. Replace the existing weather section in the README using regex pattern matching
6. Write the updated content back to the README.md file
7. Returns `true` if changes were made, `false` otherwise

**Section Template:**

```html
<!-- Hourly Weather Update -->
<td style="text-align: center;">
  ${description}
  <img
    style="width: 15px;"
    src="https://openweathermap.org/img/w/${icon}.png"
    alt=""
  />
</td>
<td style="text-align: center;">${temperature}°C</td>
<td style="text-align: center;">${sunrise}</td>
<td style="text-align: center;">${sunset}</td>
<td style="text-align: center;">${humidity}%</td>
<!-- End of Hourly Weather Update -->
```

**Error Handling:**

- Returns `false` if README.md file is not found
- Returns `false` if a weather data format is invalid
- Returns `false` if a weather section is not found in README
- Returns `false` if writing to README fails
- Returns `false` if no changes are needed to README

**Example:**

```typescript
const weatherData = 'Cloudy|30|06:18:00|18:02:00|60|03d';
const updateSuccess = await updateReadme(weatherData);

if (updateSuccess) {
  console.warn('✅ README updated successfully with new weather data.');
} else {
  console.warn('⚠️ No changes were made to the README.');
}
```

## Utilities

Utility functions that support the core application functionality.

### preload.ts

A utility module for loading and validating environment variables.

#### `ensureEnvironmentVariables()`

Validates that all required environment variables exist and are non-empty.

**Signature and Implementation:**

```typescript
export function ensureEnvironmentVariables(): void {
  const apiKey = Bun.env['OPEN_WEATHER_KEY']?.trim();

  if (!apiKey) {
    console.error(
      '[preload.ts] ❌ Missing required environment variable: OPEN_WEATHER_KEY',
    );
    throw new Error(
      '[preload.ts] ❌ Missing required environment variable: OPEN_WEATHER_KEY',
    );
  }

  console.warn('[preload.ts] ✅ Environment variables loaded successfully');
}
```

**Throws:**

- `Error` - If the `OPEN_WEATHER_KEY` environment variable is missing or empty

**Implementation Details:**

1. Checks if the `OPEN_WEATHER_KEY` environment variable exists and is non-empty
2. Throws an error if validation fails
3. Log a success message if all required variables are present

**Example:**

```typescript
// This will run automatically on import
import '@/weather-update/plugins/preload';

// Or can be called explicitly
import { ensureEnvironmentVariables } from '@/weather-update/plugins/preload';

try {
  ensureEnvironmentVariables();
  console.warn('[preload.ts] ✅ Environment variables loaded successfully');
} catch (error) {
  console.error(
    '[preload.ts] ❌ Missing required environment variable: OPEN_WEATHER_KEY',
  );
  process.exit(1);
}
```

## Type Definitions

### Weather Schema (Zod)

```typescript
const WeatherSchema = z.object({
  current: z.object({
    humidity: z.number(),
    sunrise: z.number(),
    sunset: z.number(),
    temp: z.number(),
    weather: z
      .array(
        z.object({
          icon: z.string().optional(),
          main: z.string().optional(),
        }),
      )
      .nonempty(),
  }),
});
```

This schema validates the structure of the OpenWeather API response.

## Error Handling

The application uses a consistent error handling approach:

1. **Service-specific errors** are thrown with descriptive messages
2. **API errors** are normalized with consistent error messages
3. **Validation errors** from Zod are captured and logged
4. All errors are logged to the console with clear prefixes:
   - `❌ Weather data fetch failed.`
   - `❌ Error: README.md file not found at path:`
   - `❌ Error: Invalid weather data format.`
   - `❌ Missing required environment variable: OPEN_WEATHER_KEY`

## Best Practices

When using this API:

1. **Environment Variables**: Always ensure the `OPEN_WEATHER_KEY` is set before executing the application
2. **Error Handling**: Wrap API calls in try/catch blocks to handle potential errors
3. **Weather Data Format**: Maintain the pipe-delimited format when passing data between functions
4. **Testing**: Use the provided test files as references for proper function usage
5. **Type Safety**: Leverage TypeScript's type system to ensure correct parameter usage

---

<div style="text-align: center;">
  <p>
    <strong>Profile Weather View</strong> | Developed with ❤️ using TypeScript and Bun
  </p>
  <p>
    <small>Last updated: March 2025</small>
  </p>
</div>
