/**
 * Current weather for {@link LOCATION} from Open-Meteo (free, no API key).
 *
 * One Zod schema both validates the wire format and transforms it into {@link Weather}, the
 * display-ready shape the README needs. Nothing downstream ever sees raw API data.
 *
 * @see https://open-meteo.com/en/docs
 * @module
 */

import { z } from 'zod';
import { LOCATION } from './config';
import { fetchWithRetry, type RetryOptions } from './http';
import { log } from './log';
import { type MeteoconName, wmoToMeteocon } from './meteocons';
import { formatClock } from './time';

/** Display-ready weather: exactly what the README shows, decoupled from the API's wire format. */
export interface Weather {
  /** Human description from the WMO table, e.g. `Overcast`. */
  readonly description: string;
  /** Day or night Meteocons icon for the current conditions. */
  readonly icon: MeteoconName;
  /** Air temperature at 2 m, rounded to whole °C. */
  readonly temperatureC: number;
  /** Relative humidity at 2 m, rounded to whole percent (0–100). */
  readonly humidityPct: number;
  /** Today's sunrise, `HH:MM` in {@link LOCATION.timezone}. */
  readonly sunrise: string;
  /** Today's sunset, `HH:MM` in {@link LOCATION.timezone}. */
  readonly sunset: string;
}

/** At least one Unix timestamp: an empty daily array is a schema error, not `undefined` later. */
const nonEmptyTimes = z.tuple([z.number()], z.number());

/** Validates an Open-Meteo forecast response and maps it straight to {@link Weather}. */
const OpenMeteoResponse = z
  .object({
    current: z.object({
      temperature_2m: z.number(),
      relative_humidity_2m: z.number().min(0).max(100),
      weather_code: z.int().nonnegative(),
      is_day: z.literal([0, 1]),
    }),
    daily: z.object({ sunrise: nonEmptyTimes, sunset: nonEmptyTimes }),
  })
  .transform(({ current, daily }): Weather => {
    const { name, description } = wmoToMeteocon(current.weather_code, current.is_day === 1);
    return {
      description,
      icon: name,
      temperatureC: Math.round(current.temperature_2m),
      humidityPct: Math.round(current.relative_humidity_2m),
      sunrise: formatClock(daily.sunrise[0], LOCATION.timezone),
      sunset: formatClock(daily.sunset[0], LOCATION.timezone),
    };
  });

/** Current conditions plus today's sunrise and sunset, as Unix seconds, in the display zone. */
const FORECAST_URL = `https://api.open-meteo.com/v1/forecast?${new URLSearchParams({
  latitude: String(LOCATION.latitude),
  longitude: String(LOCATION.longitude),
  current: 'temperature_2m,relative_humidity_2m,weather_code,is_day',
  daily: 'sunrise,sunset',
  timezone: LOCATION.timezone,
  timeformat: 'unixtime',
  forecast_days: '1',
}).toString()}`;

/**
 * Fetches current conditions for {@link LOCATION}.
 *
 * @param retry - Overrides for the HTTP retry policy; production uses the defaults.
 * @returns Validated, display-ready {@link Weather}.
 * @throws Error when the request fails after retries, the status is not 2xx, the body is not JSON,
 *   or the JSON does not match the expected shape (the message names the offending fields).
 * @example
 * ```ts
 * const weather = await fetchWeather();
 * // { description: 'Overcast', icon: 'overcast-night', temperatureC: 20, … }
 * ```
 */
export async function fetchWeather(retry?: Partial<RetryOptions>): Promise<Weather> {
  const start = performance.now();
  const response = await fetchWithRetry(FORECAST_URL, retry);
  if (!response.ok) {
    throw new Error(`Open-Meteo responded ${response.status} ${response.statusText}`.trimEnd());
  }

  const body: unknown = await response.json().catch((cause: unknown) => {
    throw new Error('Open-Meteo returned a non-JSON body', { cause });
  });
  const parsed = OpenMeteoResponse.safeParse(body);
  if (!parsed.success) {
    throw new Error(`Unexpected Open-Meteo response: ${z.prettifyError(parsed.error)}`, {
      cause: parsed.error,
    });
  }

  const weather = parsed.data;
  log(
    `Open-Meteo ${(performance.now() - start).toFixed(0)}ms: ${weather.description} ` +
      `${weather.temperatureC}°C ${weather.humidityPct}% ${weather.icon}`,
    'success',
  );
  return weather;
}
