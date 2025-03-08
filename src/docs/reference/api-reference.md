# API Reference

<br>

<div align="center" style="display: flex; justify-content: center; gap: 5px; flex-wrap: wrap;">
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

This API reference documents the core functionality of the Profile Weather View application. Each function is thoroughly documented with its parameters, return values, error handling, and usage examples.

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
type WeatherData = z.infer<typeof WeatherSchema>;
```

The `WeatherData` type is inferred from the Zod schema that validates the OpenWeather API response.

#### `fetchWeatherData()`

Fetches current weather data from the OpenWeather API and formats it as a string.

**Signature:**

```typescript
async function fetchWeatherData(): Promise<string>;
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
  console.log(weatherData); // "Cloudy|30|06:18 AM|06:02 PM|60|03d"
} catch (error) {
  console.error('Failed to fetch weather data:', error);
}
```

#### `convertToDhakaTime(utcSeconds: number)`

Converts a UTC timestamp to Dhaka time (UTC+6) using the Temporal API.

**Signature:**

```typescript
function convertToDhakaTime(utcSeconds: number): string;
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
console.log(dhakaTime); // "06:18:20"
```

### updateReadme.ts

The service responsible for updating the GitHub profile README with weather data.

#### `updateReadme(weatherData: string)`

Updates the README file with new weather data by replacing a specially marked section.

**Signature:**

```typescript
function updateReadme(weatherData: string): void;
```

**Parameters:**

- `weatherData` (`string`) - Formatted weather data with pipe-delimited values in the format:  
  `"description|temperature|sunrise|sunset|humidity|icon"`

**Implementation Details:**

1. Reads the README.md file from the project root
2. Parses the pipe-delimited weather data into components
3. Gets the current time formatted for display
4. Constructs the new weather section in HTML format
5. Replaces the existing weather section in the README using regex pattern matching
6. Writes the updated content back to the README.md file

**Section Template:**

```html
<!-- Hourly Weather Update -->
<td align="center">
  ${description}
  <img width="15" src="https://openweathermap.org/img/w/${icon}.png" alt="" />
</td>
<td align="center">${temperature}°C</td>
<td align="center">${sunrise}</td>
<td align="center">${sunset}</td>
<td align="center">${humidity}%</td>
<!-- End of Hourly Weather Update -->
```

**Error Handling:**

- Catches and logs errors when reading from or writing to the README file
- Continues execution even with malformed weather data input

**Example:**

```typescript
const weatherData = 'Cloudy|30|06:18 AM|06:02 PM|60|03d';
updateReadme(weatherData); // Updates README.md with the weather information
```

## Utilities

Utility functions that support the core application functionality.

### preload.ts

A utility module for loading and validating environment variables.

#### `ensureEnvironmentVariables()`

Validates that all required environment variables exist and are non-empty.

**Signature:**

```typescript
function ensureEnvironmentVariables(): void;
```

**Throws:**

- `Error` - If the `OPEN_WEATHER_KEY` environment variable is missing or empty

**Implementation Details:**

1. Checks if the `OPEN_WEATHER_KEY` environment variable exists and is non-empty
2. Throws an error if validation fails
3. Logs a success message if all required variables are present

**Auto-execution:**
This function is automatically executed when the module is imported to ensure environment variables are valid before the application runs.

**Example:**

```typescript
// This will run automatically on import
import '@/utils/preload';

// Or can be called explicitly
import { ensureEnvironmentVariables } from '@/utils/preload';
ensureEnvironmentVariables();
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
   - `❌ Failed to fetch weather data:`
   - `❌ Error reading README file:`
   - `❌ Error writing to README file:`
   - `❌ Missing required environment variable:`

## Best Practices

When using this API:

1. **Environment Variables**: Always ensure the `OPEN_WEATHER_KEY` is set before executing the application
2. **Error Handling**: Wrap API calls in try/catch blocks to handle potential errors
3. **Weather Data Format**: Maintain the pipe-delimited format when passing data between functions
4. **Testing**: Use the provided test files as references for proper function usage
5. **Type Safety**: Leverage TypeScript's type system to ensure correct parameter usage

---

<div align="center">
  <p>
    <strong>Profile Weather View</strong> | Developed with ❤️ using TypeScript and Bun
  </p>
  <p>
    <small>Last updated: March 2025</small>
  </p>
</div>
