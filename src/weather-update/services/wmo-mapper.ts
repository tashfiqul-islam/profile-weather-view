/**
 * Maps WMO weather codes to Meteocons icon names and descriptions.
 * Handles day/night variations for applicable conditions.
 *
 * @module wmo-mapper
 * @since 1.0.0
 * @see https://open-meteo.com/en/docs
 * @see https://github.com/basmilius/weather-icons
 */

// ============================================================================
// Type Definitions
// ============================================================================

/** Branded type for Meteocons icon names */
export type MeteoconIconName = string & { readonly __brand: unique symbol };

/** Meteocons icon with name and description */
export interface MeteoconIcon {
  readonly name: MeteoconIconName;
  readonly description: string;
}

// ============================================================================
// Configuration
// ============================================================================

/** Base URL for Meteocons CDN (GitHub raw content) */
const METEOCONS_BASE_URL =
  "https://raw.githubusercontent.com/basmilius/weather-icons/dev/production" as const;

/** Default icon for unknown WMO codes */
const UNKNOWN_ICON: MeteoconIcon = {
  name: "not-available" as MeteoconIconName,
  description: "Unknown",
} as const;

// ============================================================================
// WMO Code Mappings
// ============================================================================

/**
 * WMO Weather Code to Meteocons mapping for daytime conditions.
 * Each code maps to a specific icon name and human-readable description.
 */
const WMO_DAY_MAP: Readonly<Record<number, MeteoconIcon>> = {
  // Clear conditions
  0: { name: "clear-day" as MeteoconIconName, description: "Clear Sky" },

  // Partly cloudy conditions
  1: {
    name: "partly-cloudy-day" as MeteoconIconName,
    description: "Mainly Clear",
  },
  2: {
    name: "partly-cloudy-day" as MeteoconIconName,
    description: "Partly Cloudy",
  },
  3: { name: "overcast-day" as MeteoconIconName, description: "Overcast" },

  // Fog conditions
  45: { name: "fog-day" as MeteoconIconName, description: "Fog" },
  48: {
    name: "fog-day" as MeteoconIconName,
    description: "Depositing Rime Fog",
  },

  // Drizzle conditions
  51: {
    name: "partly-cloudy-day-drizzle" as MeteoconIconName,
    description: "Light Drizzle",
  },
  53: { name: "drizzle" as MeteoconIconName, description: "Moderate Drizzle" },
  55: { name: "drizzle" as MeteoconIconName, description: "Dense Drizzle" },

  // Freezing drizzle
  56: {
    name: "sleet" as MeteoconIconName,
    description: "Light Freezing Drizzle",
  },
  57: {
    name: "sleet" as MeteoconIconName,
    description: "Dense Freezing Drizzle",
  },

  // Rain conditions
  61: {
    name: "partly-cloudy-day-rain" as MeteoconIconName,
    description: "Slight Rain",
  },
  63: { name: "rain" as MeteoconIconName, description: "Moderate Rain" },
  65: { name: "rain" as MeteoconIconName, description: "Heavy Rain" },

  // Freezing rain
  66: { name: "sleet" as MeteoconIconName, description: "Light Freezing Rain" },
  67: { name: "sleet" as MeteoconIconName, description: "Heavy Freezing Rain" },

  // Snow conditions
  71: {
    name: "partly-cloudy-day-snow" as MeteoconIconName,
    description: "Slight Snow",
  },
  73: { name: "snow" as MeteoconIconName, description: "Moderate Snow" },
  75: { name: "snow" as MeteoconIconName, description: "Heavy Snow" },
  77: { name: "snow" as MeteoconIconName, description: "Snow Grains" },

  // Rain showers
  80: {
    name: "partly-cloudy-day-rain" as MeteoconIconName,
    description: "Slight Rain Showers",
  },
  81: {
    name: "rain" as MeteoconIconName,
    description: "Moderate Rain Showers",
  },
  82: { name: "rain" as MeteoconIconName, description: "Violent Rain Showers" },

  // Snow showers
  85: {
    name: "partly-cloudy-day-snow" as MeteoconIconName,
    description: "Slight Snow Showers",
  },
  86: { name: "snow" as MeteoconIconName, description: "Heavy Snow Showers" },

  // Thunderstorm conditions
  95: {
    name: "thunderstorms-day" as MeteoconIconName,
    description: "Thunderstorm",
  },
  96: {
    name: "thunderstorms-day-rain" as MeteoconIconName,
    description: "Thunderstorm with Slight Hail",
  },
  99: {
    name: "thunderstorms-day-rain" as MeteoconIconName,
    description: "Thunderstorm with Heavy Hail",
  },
} as const;

/**
 * Generates night map by replacing -day with -night in icon names.
 * Icons without -day suffix remain unchanged (e.g., "rain", "snow").
 */
function createNightMap(): Readonly<Record<number, MeteoconIcon>> {
  const nightMap: Record<number, MeteoconIcon> = {};

  for (const [codeStr, icon] of Object.entries(WMO_DAY_MAP)) {
    const code = Number(codeStr);
    const nightName = icon.name.includes("-day")
      ? icon.name.replace("-day", "-night")
      : icon.name;

    nightMap[code] = {
      name: nightName as MeteoconIconName,
      description: icon.description,
    };
  }

  return nightMap;
}

const WMO_NIGHT_MAP: Readonly<Record<number, MeteoconIcon>> = createNightMap();

// ============================================================================
// Public API
// ============================================================================

/**
 * Converts a WMO weather code to a Meteocons icon.
 *
 * @param wmoCode - WMO weather interpretation code (0-99)
 * @param isDay - Whether it's currently daytime (affects icon variant)
 * @returns Meteocons icon with name and description
 *
 * @example
 * ```ts
 * const icon = wmoToMeteocons(0, true);
 * // { name: "clear-day", description: "Clear Sky" }
 *
 * const nightIcon = wmoToMeteocons(0, false);
 * // { name: "clear-night", description: "Clear Sky" }
 * ```
 */
export function wmoToMeteocons(wmoCode: number, isDay: boolean): MeteoconIcon {
  const map = isDay ? WMO_DAY_MAP : WMO_NIGHT_MAP;
  return map[wmoCode] ?? UNKNOWN_ICON;
}

/**
 * Generates the full CDN URL for a Meteocons icon.
 *
 * @param iconName - Meteocons icon name (e.g., "clear-day", "rain")
 * @param style - Icon style: "fill" (default) or "line"
 * @returns Full URL to the SVG icon on GitHub CDN
 *
 * @example
 * ```ts
 * const url = getMeteoconUrl("clear-day");
 * // "https://raw.githubusercontent.com/.../fill/svg/clear-day.svg"
 * ```
 */
export function getMeteoconUrl(
  iconName: MeteoconIconName | string,
  style: "fill" | "line" = "fill"
): string {
  return `${METEOCONS_BASE_URL}/${style}/svg/${iconName}.svg`;
}

/**
 * Gets the weather description for a WMO code.
 * Useful when you need just the description without the icon name.
 *
 * @param wmoCode - WMO weather interpretation code
 * @returns Human-readable weather description
 */
export function getWmoDescription(wmoCode: number): string {
  return WMO_DAY_MAP[wmoCode]?.description ?? "Unknown";
}

/**
 * Title-cases a weather description for display.
 * Ensures consistent capitalization of weather conditions.
 *
 * @param description - Weather description to format
 * @returns Title-cased description
 */
export function formatWeatherDescription(description: string): string {
  if (!description) {
    return description;
  }

  return description
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
