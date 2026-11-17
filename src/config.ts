/**
 * Static configuration: the single place to point the weather at a different city.
 *
 * @module
 */

/**
 * Where the weather is measured and which clock the README shows.
 *
 * `timezone` drives both the Open-Meteo request (so sunrise/sunset are local days) and every
 * timestamp rendered into the README. Use an IANA zone name.
 */
export const LOCATION = {
  latitude: 23.8759,
  longitude: 90.3795,
  timezone: 'Asia/Dhaka',
} as const;
