/**
 * WMO code to Meteocons mapping tests.
 * Verifies all mapping functions for day/night variants and edge cases.
 */

import { describe, expect, test } from "bun:test";
import {
  formatWeatherDescription,
  getMeteoconUrl,
  getWmoDescription,
  type MeteoconIconName,
  wmoToMeteocons,
} from "@/weather-update/services/wmo-mapper";

describe("wmoToMeteocons", () => {
  test("should map daytime codes correctly", () => {
    // Clear Sky (0) -> clear-day
    expect(wmoToMeteocons(0, true)).toEqual({
      name: "clear-day" as MeteoconIconName,
      description: "Clear Sky",
    });

    // Thunderstorm (95) -> thunderstorms-day
    expect(wmoToMeteocons(95, true)).toEqual({
      name: "thunderstorms-day" as MeteoconIconName,
      description: "Thunderstorm",
    });
  });

  test("should map nighttime codes correctly", () => {
    // Clear Sky (0) -> clear-night
    expect(wmoToMeteocons(0, false)).toEqual({
      name: "clear-night" as MeteoconIconName,
      description: "Clear Sky",
    });

    // Icons without -day suffix should remain same (e.g., rain)
    // Rain (63) -> rain
    expect(wmoToMeteocons(63, false)).toEqual({
      name: "rain" as MeteoconIconName,
      description: "Moderate Rain",
    });
  });

  test("should map all defined WMO codes without returning unknown", () => {
    const definedCodes = [
      0, 1, 2, 3, 45, 48, 51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 71, 73, 75,
      77, 80, 81, 82, 85, 86, 95, 96, 99,
    ];
    for (const code of definedCodes) {
      expect(wmoToMeteocons(code, true).name).not.toBe("not-available");
      expect(wmoToMeteocons(code, false).name).not.toBe("not-available");
    }
  });

  test("should replace -day with -night for night variants that contain -day", () => {
    // fog-day -> fog-night
    expect(wmoToMeteocons(45, false).name).toContain("night");
    // partly-cloudy-day -> partly-cloudy-night
    expect(wmoToMeteocons(1, false).name).toContain("night");
  });

  test("should keep icon name unchanged for night when no -day suffix", () => {
    // snow (73) has no -day suffix, stays as "snow" at night
    expect(wmoToMeteocons(73, false).name).toBe("snow" as MeteoconIconName);
    // rain (63) has no -day suffix, stays as "rain" at night
    expect(wmoToMeteocons(63, false).name).toBe("rain" as MeteoconIconName);
    // drizzle (53) has no -day suffix
    expect(wmoToMeteocons(53, false).name).toBe("drizzle" as MeteoconIconName);
    // sleet (56) has no -day suffix
    expect(wmoToMeteocons(56, false).name).toBe("sleet" as MeteoconIconName);
  });

  test("should return unknown icon for invalid code", () => {
    expect(wmoToMeteocons(999, true)).toEqual({
      name: "not-available" as MeteoconIconName,
      description: "Unknown",
    });
  });
});

describe("getMeteoconUrl", () => {
  test("should generate fill style URL by default", () => {
    const url = getMeteoconUrl("clear-day");
    expect(url).toBe(
      "https://raw.githubusercontent.com/basmilius/weather-icons/dev/production/fill/svg/clear-day.svg"
    );
  });

  test("should generate line style URL when requested", () => {
    const url = getMeteoconUrl("clear-day", "line");
    expect(url).toBe(
      "https://raw.githubusercontent.com/basmilius/weather-icons/dev/production/line/svg/clear-day.svg"
    );
  });
});

describe("getWmoDescription", () => {
  test("should return description for known code", () => {
    expect(getWmoDescription(0)).toBe("Clear Sky");
    expect(getWmoDescription(61)).toBe("Slight Rain");
  });

  test("should return 'Unknown' for invalid code", () => {
    expect(getWmoDescription(999)).toBe("Unknown");
  });
});

describe("formatWeatherDescription", () => {
  test("should title-case normal description", () => {
    expect(formatWeatherDescription("light rain")).toBe("Light Rain");
    expect(formatWeatherDescription("CLEAR SKY")).toBe("Clear Sky");
  });

  test("should handle single word", () => {
    expect(formatWeatherDescription("rain")).toBe("Rain");
  });

  test("should handle empty string", () => {
    expect(formatWeatherDescription("")).toBe("");
  });
});
