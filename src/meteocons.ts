/**
 * WMO weather interpretation codes → Meteocons icons and descriptions. Pure.
 *
 * The code table is the single source of truth: icon names, the night variants, and the
 * {@link MeteoconName} union are all derived from it, so adding a code is a one-line change that
 * the compiler checks end to end. Descriptions come only from this table, never from API data,
 * which is why no remote string can reach the README.
 *
 * @see https://open-meteo.com/en/docs (WMO weather interpretation codes)
 * @see https://github.com/basmilius/weather-icons (Meteocons)
 * @module
 */

/** Daytime icon and human description per WMO code. */
const WMO_CODES = {
  0: ['clear-day', 'Clear Sky'],
  1: ['partly-cloudy-day', 'Mainly Clear'],
  2: ['partly-cloudy-day', 'Partly Cloudy'],
  3: ['overcast-day', 'Overcast'],
  45: ['fog-day', 'Fog'],
  48: ['fog-day', 'Depositing Rime Fog'],
  51: ['partly-cloudy-day-drizzle', 'Light Drizzle'],
  53: ['drizzle', 'Moderate Drizzle'],
  55: ['drizzle', 'Dense Drizzle'],
  56: ['sleet', 'Light Freezing Drizzle'],
  57: ['sleet', 'Dense Freezing Drizzle'],
  61: ['partly-cloudy-day-rain', 'Slight Rain'],
  63: ['rain', 'Moderate Rain'],
  65: ['rain', 'Heavy Rain'],
  66: ['sleet', 'Light Freezing Rain'],
  67: ['sleet', 'Heavy Freezing Rain'],
  71: ['partly-cloudy-day-snow', 'Slight Snow'],
  73: ['snow', 'Moderate Snow'],
  75: ['snow', 'Heavy Snow'],
  77: ['snow', 'Snow Grains'],
  80: ['partly-cloudy-day-rain', 'Slight Rain Showers'],
  81: ['rain', 'Moderate Rain Showers'],
  82: ['rain', 'Violent Rain Showers'],
  85: ['partly-cloudy-day-snow', 'Slight Snow Showers'],
  86: ['snow', 'Heavy Snow Showers'],
  95: ['thunderstorms-day', 'Thunderstorm'],
  96: ['thunderstorms-day-rain', 'Thunderstorm with Slight Hail'],
  99: ['thunderstorms-day-rain', 'Thunderstorm with Heavy Hail'],
} as const satisfies Record<number, readonly [icon: string, description: string]>;

/** Every daytime icon used in {@link WMO_CODES}. */
type DayIcon = (typeof WMO_CODES)[keyof typeof WMO_CODES][0];

/** Type-level `-day` → `-night`; icons without `-day` (rain, snow, …) are unchanged. */
type ToNight<T extends string> = T extends `${infer Head}-day${infer Tail}`
  ? `${Head}-night${Tail}`
  : T;

/** Every icon this module can emit, derived from the code table and checked at compile time. */
export type MeteoconName = DayIcon | ToNight<DayIcon> | 'not-available';

/** An icon plus the human description shown next to it. */
export interface Meteocon {
  /** Meteocons icon file name, without extension. */
  readonly name: MeteoconName;
  /** Title-case description, e.g. `Partly Cloudy`. */
  readonly description: string;
}

const UNKNOWN = { name: 'not-available', description: 'Unknown' } as const satisfies Meteocon;

/**
 * Night variant of every day icon. The mapped-type `satisfies` makes the compiler check each entry
 * against `ToNight<K>`, and fails the build if a new WMO icon is added without one.
 */
const NIGHT = {
  'clear-day': 'clear-night',
  'partly-cloudy-day': 'partly-cloudy-night',
  'overcast-day': 'overcast-night',
  'fog-day': 'fog-night',
  'partly-cloudy-day-drizzle': 'partly-cloudy-night-drizzle',
  'partly-cloudy-day-rain': 'partly-cloudy-night-rain',
  'partly-cloudy-day-snow': 'partly-cloudy-night-snow',
  'thunderstorms-day': 'thunderstorms-night',
  'thunderstorms-day-rain': 'thunderstorms-night-rain',
  drizzle: 'drizzle',
  sleet: 'sleet',
  rain: 'rain',
  snow: 'snow',
} as const satisfies { readonly [K in DayIcon]: ToNight<K> };

/** Own-property check, so prototype keys such as `-1` or `toString` never look like codes. */
const isKnownCode = (code: number): code is keyof typeof WMO_CODES =>
  Object.hasOwn(WMO_CODES, code);

/**
 * Maps a WMO weather code to its Meteocons icon and description.
 *
 * @param code - WMO weather interpretation code from Open-Meteo.
 * @param isDay - Picks the day or night icon variant.
 * @returns The icon and description, or `not-available` / `Unknown` for unlisted codes.
 * @example
 * ```ts
 * wmoToMeteocon(0, false); // { name: 'clear-night', description: 'Clear Sky' }
 * ```
 */
export function wmoToMeteocon(code: number, isDay: boolean): Meteocon {
  if (!isKnownCode(code)) return UNKNOWN;
  const [icon, description] = WMO_CODES[code];
  return { name: isDay ? icon : NIGHT[icon], description };
}

/**
 * URL of a Meteocons icon (filled SVG set) on GitHub's raw CDN.
 *
 * @param name - Icon from {@link wmoToMeteocon}.
 * @returns An absolute `https://` URL to the `.svg`.
 */
export const meteoconUrl = (name: MeteoconName): string =>
  `https://raw.githubusercontent.com/basmilius/weather-icons/dev/production/fill/svg/${name}.svg`;
