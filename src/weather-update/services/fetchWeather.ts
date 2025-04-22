import { Temporal } from '@js-temporal/polyfill';
import { z } from 'zod';

/**
 * Geographic coordinates for location tracking.
 */
const LAT = '23.8759';
const LON = '90.3795';

/**
 * Response validation schema for weather data.
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

export type WeatherData = z.infer<typeof WeatherSchema>;

type TimeString = `${number}:${number}:${number}`;

/**
 * Converts UTC timestamp to local time.
 *
 * @param {number} utcSeconds - UNIX timestamp in seconds
 * @throws {RangeError} When timestamp is outside valid range
 * @throws {TypeError} When input is not a valid number
 * @returns {TimeString} Time in HH:mm:ss format
 */
export const convertToDhakaTime = (utcSeconds: number): TimeString => {
  if (!Number.isFinite(utcSeconds)) {
    throw new TypeError('UTC seconds must be a finite number');
  }

  if (utcSeconds < 0 || utcSeconds > Number.MAX_SAFE_INTEGER) {
    throw new RangeError(
      'UTC seconds must be between 0 and Number.MAX_SAFE_INTEGER',
    );
  }

  const epochNanoseconds = BigInt(utcSeconds) * BigInt(1_000_000_000);
  const instant = Temporal.Instant.fromEpochNanoseconds(epochNanoseconds);
  const dhakaTime = instant.toZonedDateTimeISO('Asia/Dhaka');
  const plainTime = dhakaTime.toPlainTime();
  const rawTimeString = plainTime.toString();
  const timeString = rawTimeString.split('.')[0] ?? '';

  if (!/^\d{2}:\d{2}:\d{2}$/.test(timeString)) {
    throw new Error('Invalid time format generated');
  }

  return timeString as TimeString;
};

/**
 * Retrieves current weather information.
 *
 * @returns {Promise<string>} Weather data in pipe-delimited format:
 * weatherDescription|temperature|sunrise|sunset|humidity|iconCode
 * @throws {Error} On missing API key or failed request
 */
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
