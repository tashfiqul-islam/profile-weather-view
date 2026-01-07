import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import type {
  HumidityPercentage,
  TemperatureCelsius,
  TimeString,
  WeatherUpdatePayload,
} from "@/weather-update/services/fetch-weather";
import {
  createRefreshTime,
  createWeatherData,
  getSectionContent,
  performFileUpdate,
  shouldProceedWithUpdate,
  updateReadme,
  updateReadmeContent,
} from "@/weather-update/services/update-readme";
import type { MeteoconIconName } from "@/weather-update/services/wmo-mapper";

// Test constants & types

/**
 * Time constants for calculations
 */
const BASE_TIMESTAMP = 1_700_000_000;
const SIX_HOURS_SECONDS = 21_600;
const EIGHTEEN_HOURS_SECONDS = 64_800;

/**
 * Test constants with numeric separators and const assertions
 */
const TEST_CONSTANTS = {
  // File paths
  README_PATH: "README.md",
  CUSTOM_README_PATH: "custom/README.md",

  // Weather data
  DESCRIPTION: "Clear Sky",
  TEMPERATURE: 26,
  SUNRISE: "06:34",
  SUNSET: "18:31",
  HUMIDITY: 65,
  ICON: "clear-day", // Meteocons icon name

  // Time constants
  MOCK_TIMESTAMP: BASE_TIMESTAMP,
  MOCK_SUNRISE: BASE_TIMESTAMP + SIX_HOURS_SECONDS,
  MOCK_SUNSET: BASE_TIMESTAMP + EIGHTEEN_HOURS_SECONDS,

  // Validation limits
  MIN_STRING_LENGTH: 1,
  MIN_HUMIDITY: 0,
  MAX_HUMIDITY: 100,

  // Default values
  DEFAULT_ICON: "clear-day", // Meteocons default
  DEFAULT_DESCRIPTION: "Unknown",

  // Environment variables
  FORCE_UPDATE_TRUE: "true",
  FORCE_UPDATE_FALSE: "false",
  GITHUB_ACTIONS_TRUE: "true",
  GITHUB_ACTIONS_FALSE: "false",

  // Timezone
  TIMEZONE: "Asia/Dhaka",

  // Test content - Updated for Table Format
  WEATHER_SECTION: `<!-- Hourly Weather Update -->
| Weather | Temperature | Sunrise   | Sunset    | Humidity |
|---------|-------------|-----------|-----------|----------|
| ![Clear Sky icon](https://raw.githubusercontent.com/basmilius/weather-icons/dev/production/fill/svg/clear-day.svg) Clear Sky | 26°C | 06:34 | 18:31 | 65% |
<!-- End of Hourly Weather Update -->`,

  README_CONTENT: `# Profile Weather View
This is a test README.

<!-- Hourly Weather Update -->
| Weather | Temperature | Sunrise   | Sunset    | Humidity |
|---------|-------------|-----------|-----------|----------|
| ![Clear Sky icon](https://raw.githubusercontent.com/basmilius/weather-icons/dev/production/fill/svg/clear-day.svg) Clear Sky | 26°C | 06:34 | 18:31 | 65% |
<!-- End of Hourly Weather Update -->

<em>Last refresh: Monday, January 1, 2024 at 12:00:00 AM (UTC+6)</em>
`,

  UPDATED_README_CONTENT: `# Profile Weather View
This is a test README.

<!-- Hourly Weather Update -->
| Weather | Temperature | Sunrise   | Sunset    | Humidity |
|---------|-------------|-----------|-----------|----------|
| ![Partly Cloudy icon](https://raw.githubusercontent.com/basmilius/weather-icons/dev/production/fill/svg/partly-cloudy-day.svg) Partly Cloudy | 28°C | 07:15 | 19:22 | 70% |
<!-- End of Hourly Weather Update -->

<em>Last refresh: Monday, January 1, 2024 at 12:00:00 AM (UTC+6)</em>
`,
} as const;

/** Baseline payload used across tests. */
const MOCK_WEATHER_DATA: WeatherUpdatePayload = {
  description: TEST_CONSTANTS.DESCRIPTION,
  temperatureC: TEST_CONSTANTS.TEMPERATURE as TemperatureCelsius,
  sunriseLocal: TEST_CONSTANTS.SUNRISE as TimeString,
  sunsetLocal: TEST_CONSTANTS.SUNSET as TimeString,
  humidityPct: TEST_CONSTANTS.HUMIDITY as HumidityPercentage,
  icon: TEST_CONSTANTS.ICON as MeteoconIconName,
} as const;

/** Alternate payload for update flows. */
const UPDATED_WEATHER_DATA: WeatherUpdatePayload = {
  description: "Partly Cloudy",
  temperatureC: 28 as TemperatureCelsius,
  sunriseLocal: "07:15" as TimeString,
  sunsetLocal: "19:22" as TimeString,
  humidityPct: 70 as HumidityPercentage,
  icon: "partly-cloudy-day" as MeteoconIconName,
} as const;

/** Patterns used to assert replacements in README content. */
const REGEX_PATTERNS = {
  WEATHER_SECTION:
    /<!-- Hourly Weather Update -->[\s\S]*?<!-- End of Hourly Weather Update -->/,
  REFRESH_TIME: /<em>Last refresh:.*?<\/em>/,
  TEMPERATURE: /\d+°C/g,
  HUMIDITY: /\d+%/g,
  SUNRISE: /(Sunrise:?\s*)\d{1,2}:\d{2}(:\d{2})?/gi,
  SUNSET: /(Sunset:?\s*)\d{1,2}:\d{2}(:\d{2})?/gi,
  ICON: /openweathermap\.org\/img\/w\/\w+\.png/g,
  ALT_TEXT: /alt="[^"]*icon"/g,
  NONEXISTENT: /nonexistent/,
  UTC_TIMEZONE: /\(UTC\+6\)$/,
} as const;

// Test setup & utilities

// Store original values
const originalBunFile = Bun.file;
const originalBunWrite = Bun.write;

const mockBunFile = mock(originalBunFile);
const mockBunWrite = mock(originalBunWrite);

beforeEach(() => {
  // Reset mocks
  mockBunFile.mockClear();
  mockBunWrite.mockClear();

  // Set up default mocks
  mockBunFile.mockReturnValue({
    exists: () => Promise.resolve(true),
    text: () => Promise.resolve(TEST_CONSTANTS.README_CONTENT),
  } as any);

  mockBunWrite.mockResolvedValue(0);

  // Override global objects
  Bun.file = mockBunFile as any;
  Bun.write = mockBunWrite as any;

  // Clear environment variables
  Bun.env["FORCE_UPDATE"] = undefined;
  Bun.env["GITHUB_ACTIONS"] = undefined;
});

afterEach(() => {
  // Restore global objects
  Bun.file = originalBunFile;
  Bun.write = originalBunWrite;

  // Clear environment variables
  Bun.env["FORCE_UPDATE"] = undefined;
  Bun.env["GITHUB_ACTIONS"] = undefined;
});

// Helper functions

/** Creates a minimal Bun.file-like mock. */
function createMockFile(
  exists = true,
  content: string = TEST_CONSTANTS.README_CONTENT
) {
  return {
    exists: () => Promise.resolve(exists),
    text: () => Promise.resolve(content),
  };
}

/** Produces a payload with optional overrides. */
function createMockWeatherData(
  overrides: Partial<WeatherUpdatePayload> = {}
): WeatherUpdatePayload {
  return {
    ...MOCK_WEATHER_DATA,
    ...overrides,
  };
}

// ================================
// 🧪 Test Suites
// ================================

describe("updateReadme", () => {
  test("should update README successfully with valid data", async () => {
    // Setup
    const mockFile = createMockFile();
    mockBunFile.mockReturnValue(mockFile as any);
    mockBunWrite.mockResolvedValue(0);

    // Execute
    const result = await updateReadme(MOCK_WEATHER_DATA);

    // Verify
    expect(result).toBeTrue();
    expect(mockBunFile).toHaveBeenCalledWith(
      expect.stringContaining("README.md")
    );
    expect(mockBunWrite).toHaveBeenCalledTimes(1);
  });

  test("should update README with custom path", async () => {
    // Setup
    const mockFile = createMockFile();
    mockBunFile.mockReturnValue(mockFile as any);
    mockBunWrite.mockResolvedValue(0);

    // Execute
    const result = await updateReadme(
      MOCK_WEATHER_DATA,
      TEST_CONSTANTS.CUSTOM_README_PATH
    );

    // Verify
    expect(result).toBeTrue();
    expect(mockBunFile).toHaveBeenCalledWith(TEST_CONSTANTS.CUSTOM_README_PATH);
  });

  test("should return false when file does not exist", async () => {
    // Setup
    const mockFile = createMockFile(false);
    mockBunFile.mockReturnValue(mockFile as any);

    // Execute
    const result = await updateReadme(MOCK_WEATHER_DATA);

    // Verify
    expect(result).toBeFalse();
    expect(mockBunWrite).not.toHaveBeenCalled();
  });

  test("should return false when weather section is missing", async () => {
    // Setup
    const contentWithoutWeather = "# README\nNo weather section here.";
    const mockFile = createMockFile(true, contentWithoutWeather);
    mockBunFile.mockReturnValue(mockFile as any);

    // Execute
    const result = await updateReadme(MOCK_WEATHER_DATA);

    // Verify
    expect(result).toBeFalse();
    expect(mockBunWrite).not.toHaveBeenCalled();
  });

  test("should return false when weather data validation fails", async () => {
    // Setup
    const mockFile = createMockFile();
    mockBunFile.mockReturnValue(mockFile as any);

    const invalidWeatherData = {
      description: "", // Invalid: empty string
      temperatureC: 26 as TemperatureCelsius,
      sunriseLocal: "06:34" as TimeString,
      sunsetLocal: "18:31" as TimeString,
      humidityPct: 65 as HumidityPercentage,
      icon: "clear-day" as MeteoconIconName,
    };

    // Execute
    const result = await updateReadme(invalidWeatherData);

    // Verify
    expect(result).toBeFalse();
    expect(mockBunWrite).not.toHaveBeenCalled();
  });

  test("should return false when no changes are needed and FORCE_UPDATE is false", async () => {
    // Setup - Create content that will remain unchanged after update
    const unchangedContent = `# Profile Weather View
This is a test README.

<!-- Hourly Weather Update -->
![Weather](https://raw.githubusercontent.com/basmilius/weather-icons/dev/production/fill/svg/clear-day.svg)
**Current Weather:** Clear Sky
- **Temperature:** 26°C
- **Humidity:** 65%
- **Sunrise:** 06:34
- **Sunset:** 18:31
<!-- End of Hourly Weather Update -->

<em>Last refresh: ${createRefreshTime()}</em>
`;

    const mockFile = {
      exists: () => Promise.resolve(true),
      text: () => Promise.resolve(unchangedContent),
    };
    mockBunFile.mockReturnValue(mockFile as any);
    process.env["FORCE_UPDATE"] = TEST_CONSTANTS.FORCE_UPDATE_FALSE;

    // Use the exact same weather data that's already in the content
    const sameWeatherData: WeatherUpdatePayload = {
      description: "Clear Sky",
      temperatureC: 26 as TemperatureCelsius,
      sunriseLocal: "06:34" as TimeString,
      sunsetLocal: "18:31" as TimeString,
      humidityPct: 65 as HumidityPercentage,
      icon: "clear-day" as MeteoconIconName,
    };

    // Execute
    const result = await updateReadme(sameWeatherData);

    // Verify - Should return false because content is unchanged and FORCE_UPDATE is false
    expect(result).toBeFalse();
    expect(mockBunWrite).not.toHaveBeenCalled();
  });

  test("should proceed with update when FORCE_UPDATE is true", async () => {
    // Setup
    const mockFile = createMockFile();
    mockBunFile.mockReturnValue(mockFile as any);
    mockBunWrite.mockResolvedValue(0);
    process.env["FORCE_UPDATE"] = TEST_CONSTANTS.FORCE_UPDATE_TRUE;

    // Execute
    const result = await updateReadme(MOCK_WEATHER_DATA);

    // Verify
    expect(result).toBeTrue();
    expect(mockBunWrite).toHaveBeenCalledTimes(1);
  });

  test("should handle file write error", async () => {
    // Setup
    const mockFile = createMockFile();
    mockBunFile.mockReturnValue(mockFile as any);
    mockBunWrite.mockRejectedValue(new Error("Write failed"));

    // Execute & Verify - Should throw error
    await expect(updateReadme(UPDATED_WEATHER_DATA)).rejects.toThrow(
      "Write failed"
    );
  });
});

describe("updateReadmeContent", () => {
  test("should update weather section and refresh time", () => {
    // Setup
    const updatedWeatherData = "Updated weather section";
    const refreshTime = "Monday, January 1, 2024 at 12:00:00 AM (UTC+6)";

    // Execute
    const result = updateReadmeContent(
      TEST_CONSTANTS.README_CONTENT,
      updatedWeatherData,
      refreshTime
    );

    // Verify
    expect(result).toContain(updatedWeatherData);
    expect(result).toContain(`<em>Last refresh: ${refreshTime}</em>`);
  });

  test("should handle missing refresh time", () => {
    // Setup
    const contentWithoutRefresh = "# README\nNo refresh time here.";
    const updatedWeatherData = "Updated weather section";
    const refreshTime = "Monday, January 1, 2024 at 12:00:00 AM (UTC+6)";

    // Execute
    const result = updateReadmeContent(
      contentWithoutRefresh,
      updatedWeatherData,
      refreshTime
    );

    // Verify
    expect(result).toBe(contentWithoutRefresh); // No weather section to replace
    expect(result).not.toContain(`<em>Last refresh: ${refreshTime}</em>`);
  });

  test("should handle content without refresh time regex match", () => {
    // Setup - Create content that has weather section but no refresh time pattern
    const contentWithWeatherButNoRefresh = `# Profile Weather View
This is a test README.

<!-- Hourly Weather Update -->
![Weather](https://raw.githubusercontent.com/basmilius/weather-icons/dev/production/fill/svg/clear-day.svg)
**Current Weather:** Clear Sky
- **Temperature:** 26°C
- **Humidity:** 65%
- **Sunrise:** 06:34
- **Sunset:** 18:31
<!-- End of Hourly Weather Update -->

Some other content without refresh time pattern.`;

    const updatedWeatherData = "Updated weather section";
    const refreshTime = "Monday, January 1, 2024 at 12:00:00 AM (UTC+6)";

    // Execute
    const result = updateReadmeContent(
      contentWithWeatherButNoRefresh,
      updatedWeatherData,
      refreshTime
    );

    // Verify - Should update weather section but not add refresh time
    expect(result).toContain(updatedWeatherData);
    expect(result).not.toContain(`<em>Last refresh: ${refreshTime}</em>`);
    expect(result).toContain(
      "Some other content without refresh time pattern."
    );
  });
});

describe("createWeatherData", () => {
  test("should create weather data with all fields correctly formatted in table row", () => {
    // Setup
    const currentSection = TEST_CONSTANTS.WEATHER_SECTION;

    // Execute
    const result = createWeatherData(UPDATED_WEATHER_DATA, currentSection);

    // Verify
    expect(result).toContain(
      `| <img src="https://raw.githubusercontent.com/basmilius/weather-icons/dev/production/fill/svg/partly-cloudy-day.svg" alt="Partly Cloudy icon" height="17" style="vertical-align: middle;"> Partly Cloudy | 28°C | 07:15 | 19:22 | 70% |`
    );
  });

  test("should handle missing icon with default URL generation", () => {
    // Setup
    const weatherDataWithoutIcon = {
      ...UPDATED_WEATHER_DATA,
      icon: "not-available" as MeteoconIconName,
    };
    const currentSection = TEST_CONSTANTS.WEATHER_SECTION;

    // Execute
    const result = createWeatherData(weatherDataWithoutIcon, currentSection);

    // Verify
    expect(result).toContain("not-available.svg");
    expect(result).toContain("not-available");
  });

  test("should replace entire row regardless of previous content (robustness)", () => {
    // Setup - Section with "garbage" data row
    const garbageSection = `<!-- Hourly Weather Update -->
| Weather | Temperature | Sunrise   | Sunset    | Humidity |
|---------|-------------|-----------|-----------|----------|
| Garbage Data that doesnt match anything | 999C | 00:00 | 00:00 | 0% |
<!-- End of Hourly Weather Update -->`;

    const weatherData = {
      ...UPDATED_WEATHER_DATA,
      description: "Heavy Rain",
    };

    // Execute
    const result = createWeatherData(weatherData, garbageSection);

    // Verify - Should correctly replace the garbage row with formatted data
    expect(result).toContain(`| <img src="`);
    expect(result).toContain(
      `" alt="Heavy Rain icon" height="17" style="vertical-align: middle;"> Heavy Rain |`
    );
    expect(result).not.toContain("Garbage Data");
  });

  test("should handle empty current section", () => {
    // Setup
    const currentSection = "";

    // Execute
    const result = createWeatherData(UPDATED_WEATHER_DATA, currentSection);

    // Verify - Should return empty string as there are no lines to map
    expect(result).toBe("");
  });

  test("should preserve table headers and structure", () => {
    // Setup
    const currentSection = TEST_CONSTANTS.WEATHER_SECTION;

    // Execute
    const result = createWeatherData(UPDATED_WEATHER_DATA, currentSection);

    // Verify
    expect(result).toContain(
      "| Weather | Temperature | Sunrise   | Sunset    | Humidity |"
    );
    expect(result).toContain(
      "|---------|-------------|-----------|-----------|----------|"
    );
    expect(result).toContain("<!-- Hourly Weather Update -->");
    expect(result).toContain("<!-- End of Hourly Weather Update -->");
  });
});

describe("createWeatherData - HTML Table Format", () => {
  // HTML table section matching the user's profile README format
  const HTML_WEATHER_SECTION = `<!-- Hourly Weather Update -->
        <td align="center">Drizzle <img width="15" src="https://openweathermap.org/img/w/50n.png" alt="Fog icon"></td>
        <td align="center">13°C</td>
        <td align="center">05:33</td>
        <td align="center">18:33</td>
        <td align="center">100%</td>
        <!-- End of Hourly Weather Update -->`;

  test("should detect and update HTML table format", () => {
    // Execute
    const result = createWeatherData(
      UPDATED_WEATHER_DATA,
      HTML_WEATHER_SECTION
    );

    // Verify - Should contain updated values
    expect(result).toContain("Partly Cloudy");
    expect(result).toContain("28°C");
    expect(result).toContain("07:15");
    expect(result).toContain("19:22");
    expect(result).toContain("70%");
  });

  test("should preserve HTML table structure with align attributes", () => {
    // Execute
    const result = createWeatherData(
      UPDATED_WEATHER_DATA,
      HTML_WEATHER_SECTION
    );

    // Verify - Should preserve <td align="center"> attributes
    expect(result).toContain('<td align="center">');
    expect(result).toContain("</td>");
    expect(result).toContain("<!-- Hourly Weather Update -->");
    expect(result).toContain("<!-- End of Hourly Weather Update -->");
  });

  test("should include Meteocons icon in HTML format", () => {
    // Execute
    const result = createWeatherData(
      UPDATED_WEATHER_DATA,
      HTML_WEATHER_SECTION
    );

    // Verify - Should contain Meteocons URL instead of OpenWeatherMap
    expect(result).toContain("basmilius/weather-icons");
    expect(result).toContain("partly-cloudy-day.svg");
    expect(result).toContain('<img width="15"');
  });

  test("should update all five cells correctly", () => {
    // Setup
    const weatherData: WeatherUpdatePayload = {
      description: "Thunderstorm",
      temperatureC: -5 as TemperatureCelsius,
      sunriseLocal: "06:00" as TimeString,
      sunsetLocal: "18:00" as TimeString,
      humidityPct: 95 as HumidityPercentage,
      icon: "thunderstorms-day" as MeteoconIconName,
    };

    // Execute
    const result = createWeatherData(weatherData, HTML_WEATHER_SECTION);

    // Verify each cell
    expect(result).toContain("Thunderstorm");
    expect(result).toContain("-5°C");
    expect(result).toContain("06:00");
    expect(result).toContain("18:00");
    expect(result).toContain("95%");
    expect(result).toContain("thunderstorms-day.svg");
  });

  test("should handle HTML table with minimal whitespace", () => {
    // Setup - Compact HTML format
    const compactHtml =
      "<!-- Hourly Weather Update --><td>Rain</td><td>20°C</td><td>06:00</td><td>18:00</td><td>80%</td><!-- End of Hourly Weather Update -->";

    // Execute
    const result = createWeatherData(UPDATED_WEATHER_DATA, compactHtml);

    // Verify
    expect(result).toContain("Partly Cloudy");
    expect(result).toContain("28°C");
  });

  test("should preserve extra cells beyond the first 5 in HTML table", () => {
    // Setup - HTML table with 6+ cells (extra cells should remain unchanged)
    const htmlWithExtraCells = `<!-- Hourly Weather Update -->
        <td align="center">Rain</td>
        <td align="center">20°C</td>
        <td align="center">06:00</td>
        <td align="center">18:00</td>
        <td align="center">80%</td>
        <td align="center">Extra Cell</td>
        <td>Another Extra</td>
        <!-- End of Hourly Weather Update -->`;

    // Execute
    const result = createWeatherData(UPDATED_WEATHER_DATA, htmlWithExtraCells);

    // Verify - First 5 cells should be updated, extra cells preserved
    expect(result).toContain("Partly Cloudy");
    expect(result).toContain("28°C");
    expect(result).toContain("07:15");
    expect(result).toContain("19:22");
    expect(result).toContain("70%");
    // Extra cells should remain unchanged
    expect(result).toContain("Extra Cell");
    expect(result).toContain("Another Extra");
  });

  test("should not modify HTML table with fewer than 5 cells", () => {
    // Setup - Incomplete HTML table
    const incompleteHtml =
      "<!-- Hourly Weather Update --><td>Rain</td><td>20°C</td><!-- End of Hourly Weather Update -->";

    // Execute
    const result = createWeatherData(UPDATED_WEATHER_DATA, incompleteHtml);

    // Verify - Should return unchanged (not enough cells to update)
    expect(result).toContain("Rain");
    expect(result).toContain("20°C");
    expect(result).not.toContain("Partly Cloudy");
  });
});

describe("createRefreshTime", () => {
  test("should create formatted refresh time", () => {
    // Execute
    const result = createRefreshTime();

    // Verify
    expect(result).toMatch(REGEX_PATTERNS.UTC_TIMEZONE);
    expect(result).toContain("2026"); // Should contain current year
    expect(result).toContain("(UTC+6)");
  });
});

describe("getSectionContent", () => {
  test("should extract content from regex match", () => {
    // Setup
    const content = TEST_CONSTANTS.README_CONTENT;
    const regex = REGEX_PATTERNS.WEATHER_SECTION;

    // Execute
    const result = getSectionContent(content, regex);

    // Verify
    expect(result).toContain("<!-- Hourly Weather Update -->");
    expect(result).toContain("<!-- End of Hourly Weather Update -->");
  });

  test("should return empty string when no match", () => {
    // Setup
    const content = "No weather section here.";
    const regex = REGEX_PATTERNS.WEATHER_SECTION;

    // Execute
    const result = getSectionContent(content, regex);

    // Verify
    expect(result).toBe("");
  });
});

describe("shouldProceedWithUpdate", () => {
  test("should return true when content has changed", () => {
    // Setup
    const oldContent = "Old content";
    const updatedContent = "New content";

    // Execute
    const result = shouldProceedWithUpdate(oldContent, updatedContent);

    // Verify
    expect(result).toBeTrue();
  });

  test("should return false when content is unchanged and FORCE_UPDATE is false", () => {
    // Setup
    const content = "Same content";
    Bun.env["FORCE_UPDATE"] = TEST_CONSTANTS.FORCE_UPDATE_FALSE;

    // Execute
    const result = shouldProceedWithUpdate(content, content);

    // Verify
    expect(result).toBeFalse();
  });

  test("should return true when content is unchanged but FORCE_UPDATE is true", () => {
    // Setup
    const content = "Same content";
    Bun.env["FORCE_UPDATE"] = TEST_CONSTANTS.FORCE_UPDATE_TRUE;

    // Execute
    const result = shouldProceedWithUpdate(content, content);

    // Verify
    expect(result).toBeTrue();
  });

  test("should handle missing FORCE_UPDATE environment variable", () => {
    // Setup
    const content = "Same content";
    Bun.env["FORCE_UPDATE"] = undefined;

    // Execute
    const result = shouldProceedWithUpdate(content, content);

    // Verify
    expect(result).toBeFalse();
  });

  test("should handle invalid FORCE_UPDATE value", () => {
    // Setup
    const content = "Same content";
    Bun.env["FORCE_UPDATE"] = "invalid";

    // Execute
    const result = shouldProceedWithUpdate(content, content);

    // Verify
    expect(result).toBeFalse();
  });

  test("should handle environment variable parsing with both set", () => {
    // Setup
    const content = "Same content";
    Bun.env["FORCE_UPDATE"] = "true";
    Bun.env["GITHUB_ACTIONS"] = "true";

    // Execute
    const result = shouldProceedWithUpdate(content, content);

    // Verify - Should return true when FORCE_UPDATE is true
    expect(result).toBeTrue();
  });
});

describe("Edge Cases and Error Scenarios", () => {
  test("should handle weather data with extreme values", () => {
    // Setup
    const extremeWeatherData = {
      description: "Extreme Weather",
      temperatureC: -50 as TemperatureCelsius,
      sunriseLocal: "00:00" as TimeString,
      sunsetLocal: "23:59" as TimeString,
      humidityPct: 100 as HumidityPercentage,
      icon: "thunderstorms-day" as MeteoconIconName,
    };
    const currentSection = TEST_CONSTANTS.WEATHER_SECTION;

    // Execute
    const result = createWeatherData(extremeWeatherData, currentSection);

    // Verify
    expect(result).toContain("-50°C");
    expect(result).toContain("100%");
    expect(result).toContain("Extreme Weather");
  });

  test("should handle malformed weather section", () => {
    // Setup
    const malformedSection =
      "<!-- Hourly Weather Update -->\nMalformed content\n<!-- End of Hourly Weather Update -->";

    // Execute
    const result = createWeatherData(UPDATED_WEATHER_DATA, malformedSection);

    // Verify
    expect(result).toContain("Malformed content");
  });

  test("should handle special characters in weather description", () => {
    // Setup
    const specialWeatherData = {
      ...UPDATED_WEATHER_DATA,
      description: "Heavy Rain & Thunderstorms",
    };
    const currentSection = TEST_CONSTANTS.WEATHER_SECTION;

    // Execute
    const result = createWeatherData(specialWeatherData, currentSection);

    // Verify
    expect(result).toContain("Heavy Rain & Thunderstorms");
  });
});

describe("Type Safety and Validation", () => {
  test("should validate branded types correctly", () => {
    // Setup
    const validWeatherData = createMockWeatherData();

    // Execute & Verify
    expect(validWeatherData.temperatureC).toBeTypeOf("number");
    expect(validWeatherData.humidityPct).toBeTypeOf("number");
    expect(validWeatherData.sunriseLocal).toBeTypeOf("string");
    expect(validWeatherData.sunsetLocal).toBeTypeOf("string");
  });

  test("should handle validation limits", () => {
    // Setup
    const weatherDataAtLimits = {
      description: "A", // Minimum length
      temperatureC: 0 as TemperatureCelsius,
      sunriseLocal: "0:00" as TimeString,
      sunsetLocal: "23:59" as TimeString,
      humidityPct: 0 as HumidityPercentage, // Minimum humidity
      icon: "clear-day" as MeteoconIconName,
    };

    // Execute
    const result = createWeatherData(
      weatherDataAtLimits,
      TEST_CONSTANTS.WEATHER_SECTION
    );

    // Verify
    expect(result).toContain("0°C");
    expect(result).toContain("0%");
  });

  test("should handle maximum humidity value", () => {
    // Setup
    const maxHumidityWeather = {
      ...UPDATED_WEATHER_DATA,
      humidityPct: 100 as HumidityPercentage,
    };

    // Execute
    const result = createWeatherData(
      maxHumidityWeather,
      TEST_CONSTANTS.WEATHER_SECTION
    );

    // Verify
    expect(result).toContain("100%");
  });
});

describe("performFileUpdate", () => {
  test("should successfully write file", async () => {
    // Setup
    const bytesWritten = 100;
    mockBunWrite.mockResolvedValue(bytesWritten);

    // Execute
    const result = await performFileUpdate("test.md", "test content");

    // Verify
    expect(result).toBe(bytesWritten);
  });
});

describe("validateAndExtractWeatherData", () => {
  test("should handle validation success path with branded type assertions", async () => {
    // Setup - Create a scenario that will trigger the successful validation path
    // and ensure all branded type assertions are executed
    const mockFile = createMockFile();
    mockBunFile.mockReturnValue(mockFile as any);
    mockBunWrite.mockResolvedValue(0);

    const validWeatherData = {
      description: "Test Weather",
      temperatureC: 25 as TemperatureCelsius,
      sunriseLocal: "07:00" as TimeString,
      sunsetLocal: "19:00" as TimeString,
      humidityPct: 75 as HumidityPercentage,
      icon: "partly-cloudy-day" as MeteoconIconName,
    };

    // Execute - This should trigger the successful validation path
    const result = await updateReadme(validWeatherData);

    // Verify - The function should succeed and all branded type assertions should be covered
    expect(result).toBeTrue();
    expect(mockBunWrite).toHaveBeenCalledTimes(1);
  });
});
