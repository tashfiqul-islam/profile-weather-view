import { z } from 'zod';
import { Temporal } from '@js-temporal/polyfill';

/**
 * ✅ OpenWeather API Constants
 * - Latitude and Longitude for Uttara, Dhaka.
 */
const LAT = '23.8759';
const LON = '90.3795';

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

export type WeatherData = z.infer<typeof WeatherSchema>;

/**
 * 🕒 Converts a UTC timestamp to Dhaka time using Temporal API.
 */
export function convertToDhakaTime(utcSeconds: number): string {
  return Temporal.Instant.fromEpochSeconds(utcSeconds)
    .toZonedDateTimeISO('Asia/Dhaka')
    .toPlainTime()
    .toString()
    .replace(/\.\d+/, ''); // HH:mm:ss format
}

/**
 * 🌍 Fetches current weather data from OpenWeather API.
 */
export async function fetchWeatherData(): Promise<string> {
  const API_KEY = Bun.env.OPEN_WEATHER_KEY?.trim();

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
