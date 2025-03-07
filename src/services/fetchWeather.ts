import { z } from 'zod';
import dotenv from 'dotenv';
import { Temporal } from '@js-temporal/polyfill';

// Load environment variables
dotenv.config();

/**
 * ✅ OpenWeather API Constants
 * - Latitude and Longitude for Uttara, Dhaka.
 */
const LAT = '23.8759'; // Latitude for Uttara, Dhaka
const LON = '90.3795'; // Longitude for Uttara, Dhaka

/**
 * ✅ Define Zod Schema for API Response Validation
 */
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

type WeatherData = z.infer<typeof WeatherSchema>;

/**
 * 🕒 Converts a UTC timestamp to Dhaka time using Temporal API.
 * @param {number} utcSeconds - UTC timestamp in seconds.
 * @returns {string} - Formatted time in Dhaka timezone.
 */
export function convertToDhakaTime(utcSeconds: number): string {
  return Temporal.Instant.fromEpochSeconds(utcSeconds)
    .toZonedDateTimeISO('Asia/Dhaka')
    .toPlainTime()
    .toString()
    .replace(/\.\d+/, ''); // Ensure HH:mm:ss format
}

/**
 * 🌍 Fetches current weather data from OpenWeather API.
 * @returns {Promise<string>} - Weather data in formatted string.
 * @throws {Error} - If API key is missing, request fails, or response is invalid.
 */
export async function fetchWeatherData(): Promise<string> {
  // ✅ Read API key dynamically on each function call
  const API_KEY = process.env.OPEN_WEATHER_KEY?.trim();

  // Check for API key before making the request
  if (!API_KEY) {
    console.error('❌ Missing required environment variable: OPEN_WEATHER_KEY');
    throw new Error('Process exited');
  }

  const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${LAT}&lon=${LON}&exclude=minutely,hourly,daily,alerts&appid=${API_KEY}&units=metric`;

  console.warn('🌍 Fetching weather data from OpenWeather API...');

  try {
    const response = await fetch(url);

    // ❌ Handle HTTP response errors
    if (!response.ok) {
      throw new Error(
        `❌ HTTP Error ${response.status}: ${response.statusText}`,
      );
    }

    const rawData: unknown = await response.json();

    // ✅ Validate API response with Zod
    const data: WeatherData = WeatherSchema.parse(rawData);

    const { humidity, sunrise, sunset, temp, weather } = data.current;

    // 🌡️ Format Weather Data
    const roundedTemperature = Math.round(temp);
    const sunriseTime = convertToDhakaTime(sunrise);
    const sunsetTime = convertToDhakaTime(sunset);
    const weatherDescription = weather[0].main ?? 'Unknown';
    const iconCode = weather[0].icon ?? '01d'; // Default to a clear sky icon

    console.warn(`🌅 Raw Sunrise (UTC): ${sunrise}`);
    console.warn(`🌇 Raw Sunset (UTC): ${sunset}`);
    console.warn(
      `🕒 Converted Sunrise (Dhaka): ${convertToDhakaTime(sunrise)}`,
    );
    console.warn(`🕒 Converted Sunset (Dhaka): ${convertToDhakaTime(sunset)}`);

    return `${weatherDescription}|${roundedTemperature}|${sunriseTime}|${sunsetTime}|${humidity}|${iconCode}`;
  } catch (error) {
    // Normalize the error into an Error object
    const normalizedError =
      error instanceof Error ? error : new Error(String(error));

    if (normalizedError instanceof z.ZodError) {
      console.error('❌ Invalid API response format:', normalizedError.errors);
    } else {
      console.error(
        '❌ Failed to fetch weather data:',
        normalizedError.message,
      );
    }
    throw new Error('❌ Weather data fetch failed. Check logs for details.');
  }
}
