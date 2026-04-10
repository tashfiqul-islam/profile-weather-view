/**
 * Tests for index.ts: Main orchestrator, error handling, and status reporting.
 * Mocks all service dependencies to test orchestration logic in isolation.
 */

import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  mock,
  test,
} from "bun:test";

// We need to test the functions by importing the module
// The `if (Bun.env.NODE_ENV !== "test")` guard prevents auto-execution

describe("index.ts orchestrator", () => {
  let stdoutCalls: string[];
  let stderrCalls: string[];
  const originalStdoutWrite = process.stdout.write;
  const originalStderrWrite = process.stderr.write;
  const originalFetch = global.fetch;

  beforeEach(() => {
    stdoutCalls = [];
    stderrCalls = [];
    process.stdout.write = (chunk: string) => {
      stdoutCalls.push(chunk);
      return true;
    };
    process.stderr.write = (chunk: string) => {
      stderrCalls.push(chunk);
      return true;
    };
  });

  afterEach(() => {
    process.stdout.write = originalStdoutWrite;
    process.stderr.write = originalStderrWrite;
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  describe("main()", () => {
    test("should complete successfully with valid weather data", async () => {
      const originalPath = Bun.env["PROFILE_README_PATH"];
      Bun.env["PROFILE_README_PATH"] = "";

      // Mock fetch for the weather API call
      const MOCK_API_RESPONSE = {
        current: {
          temperature_2m: 25,
          relative_humidity_2m: 60,
          weather_code: 0,
          is_day: 1,
        },
        daily: {
          sunrise: [1_704_153_600],
          sunset: [1_704_196_800],
        },
        utc_offset_seconds: 21_600,
      };

      global.fetch = mock(() =>
        Promise.resolve(Response.json(MOCK_API_RESPONSE))
      ) as unknown as typeof fetch;

      // Mock Bun.file for the README and tracking file
      const originalBunFile = Bun.file;
      const originalBunWrite = Bun.write;

      const mockFileContent = `# Profile
<!-- Hourly Weather Update -->
| Weather | Temp | Sunrise | Sunset | Humidity |
|---------|------|---------|--------|----------|
| Clear | 20°C | 06:00 | 18:00 | 50% |
<!-- End of Hourly Weather Update -->
<em>Last refresh: old time</em>`;

      (Bun as Record<string, unknown>)["file"] = (path: string) => {
        if (String(path).includes(".api-calls")) {
          return {
            exists: () => Promise.resolve(false),
            text: () => Promise.resolve(""),
          };
        }
        return {
          exists: () => Promise.resolve(true),
          text: () => Promise.resolve(mockFileContent),
          size: mockFileContent.length,
        };
      };
      (Bun as Record<string, unknown>)["write"] = () => Promise.resolve(100);

      const { main } = await import("@/weather-update/index");
      await main();

      const allOutput = [...stdoutCalls, ...stderrCalls].join("");
      expect(allOutput).toContain("Starting weather update");
      expect(allOutput).toContain("Weather data updated in");

      // Restore
      Bun.env["PROFILE_README_PATH"] = originalPath;
      (Bun as Record<string, unknown>)["file"] = originalBunFile;
      (Bun as Record<string, unknown>)["write"] = originalBunWrite;
    });

    test("should throw when ensureEnvironmentVariables fails", async () => {
      // Mock the tracking file to indicate rate limit exceeded
      const originalBunFile = Bun.file;

      (Bun as Record<string, unknown>)["file"] = (path: string) => {
        if (String(path).includes(".api-calls")) {
          return {
            exists: () => Promise.resolve(true),
            text: () =>
              Promise.resolve(
                JSON.stringify({
                  date: new Date().toISOString().split("T")[0],
                  calls: 1000,
                })
              ),
          };
        }
        return originalBunFile(path);
      };

      const { main } = await import("@/weather-update/index");
      await expect(main()).rejects.toThrow("API call limit exceeded");

      (Bun as Record<string, unknown>)["file"] = originalBunFile;
    });

    test("should throw when fetchWeatherData fails", async () => {
      // Mock tracking to pass rate limit
      const originalBunFile = Bun.file;
      const originalBunWrite = Bun.write;

      (Bun as Record<string, unknown>)["file"] = (path: string) => {
        if (String(path).includes(".api-calls")) {
          return {
            exists: () => Promise.resolve(false),
            text: () => Promise.resolve(""),
          };
        }
        return originalBunFile(path);
      };
      (Bun as Record<string, unknown>)["write"] = () => Promise.resolve(0);

      // Mock fetch to fail
      global.fetch = mock(() =>
        Promise.resolve(
          new Response("Server Error", {
            status: 500,
            statusText: "Internal Server Error",
          })
        )
      ) as unknown as typeof fetch;

      const { main } = await import("@/weather-update/index");
      await expect(main()).rejects.toThrow("Open-Meteo API failed");

      (Bun as Record<string, unknown>)["file"] = originalBunFile;
      (Bun as Record<string, unknown>)["write"] = originalBunWrite;
    });

    test("should log GitHub Actions context when GITHUB_ACTIONS is set", async () => {
      const originalGHA = Bun.env["GITHUB_ACTIONS"];
      const originalPath = Bun.env["PROFILE_README_PATH"];
      Bun.env["GITHUB_ACTIONS"] = "true";
      Bun.env["PROFILE_README_PATH"] = "";

      const MOCK_API_RESPONSE = {
        current: {
          temperature_2m: 25,
          relative_humidity_2m: 60,
          weather_code: 0,
          is_day: 1,
        },
        daily: {
          sunrise: [1_704_153_600],
          sunset: [1_704_196_800],
        },
        utc_offset_seconds: 21_600,
      };

      global.fetch = mock(() =>
        Promise.resolve(Response.json(MOCK_API_RESPONSE))
      ) as unknown as typeof fetch;

      const originalBunFile = Bun.file;
      const originalBunWrite = Bun.write;
      const mockFileContent = `# Profile
<!-- Hourly Weather Update -->
| Weather | Temp | Sunrise | Sunset | Humidity |
|---------|------|---------|--------|----------|
| Clear | 20°C | 06:00 | 18:00 | 50% |
<!-- End of Hourly Weather Update -->
<em>Last refresh: old time</em>`;

      (Bun as Record<string, unknown>)["file"] = (path: string) => {
        if (String(path).includes(".api-calls")) {
          return {
            exists: () => Promise.resolve(false),
            text: () => Promise.resolve(""),
          };
        }
        return {
          exists: () => Promise.resolve(true),
          text: () => Promise.resolve(mockFileContent),
          size: mockFileContent.length,
        };
      };
      (Bun as Record<string, unknown>)["write"] = () => Promise.resolve(100);

      const { main } = await import("@/weather-update/index");
      await main();

      const allOutput = [...stdoutCalls, ...stderrCalls].join("");
      expect(allOutput).toContain("env=ci");

      Bun.env["GITHUB_ACTIONS"] = originalGHA;
      Bun.env["PROFILE_README_PATH"] = originalPath;
      (Bun as Record<string, unknown>)["file"] = originalBunFile;
      (Bun as Record<string, unknown>)["write"] = originalBunWrite;
    });

    test("should validate PROFILE_README_PATH rejects non-.md paths", async () => {
      const originalPath = Bun.env["PROFILE_README_PATH"];
      Bun.env["PROFILE_README_PATH"] = "some/file.txt";

      const originalBunFile = Bun.file;
      const originalBunWrite = Bun.write;
      (Bun as Record<string, unknown>)["file"] = (path: string) => {
        if (String(path).includes(".api-calls")) {
          return {
            exists: () => Promise.resolve(false),
            text: () => Promise.resolve(""),
          };
        }
        return originalBunFile(path);
      };
      (Bun as Record<string, unknown>)["write"] = () => Promise.resolve(0);

      global.fetch = mock(() =>
        Promise.resolve(
          Response.json({
            current: {
              temperature_2m: 25,
              relative_humidity_2m: 60,
              weather_code: 0,
              is_day: 1,
            },
            daily: { sunrise: [1_704_153_600], sunset: [1_704_196_800] },
            utc_offset_seconds: 21_600,
          })
        )
      ) as unknown as typeof fetch;

      const { main } = await import("@/weather-update/index");
      await expect(main()).rejects.toThrow("Invalid PROFILE_README_PATH");

      Bun.env["PROFILE_README_PATH"] = originalPath;
      (Bun as Record<string, unknown>)["file"] = originalBunFile;
      (Bun as Record<string, unknown>)["write"] = originalBunWrite;
    });
  });

  describe("reportUpdateStatus (via main output)", () => {
    test("should emit CHANGES_DETECTED=true on successful update in CI", async () => {
      const originalPath = Bun.env["PROFILE_README_PATH"];
      const originalGHA = Bun.env["GITHUB_ACTIONS"];
      Bun.env["PROFILE_README_PATH"] = "";
      Bun.env["GITHUB_ACTIONS"] = "true";

      const MOCK_API_RESPONSE = {
        current: {
          temperature_2m: 25,
          relative_humidity_2m: 60,
          weather_code: 0,
          is_day: 1,
        },
        daily: {
          sunrise: [1_704_153_600],
          sunset: [1_704_196_800],
        },
        utc_offset_seconds: 21_600,
      };

      global.fetch = mock(() =>
        Promise.resolve(Response.json(MOCK_API_RESPONSE))
      ) as unknown as typeof fetch;

      const originalBunFile = Bun.file;
      const originalBunWrite = Bun.write;
      const mockFileContent = `# Profile
<!-- Hourly Weather Update -->
| Weather | Temp | Sunrise | Sunset | Humidity |
|---------|------|---------|--------|----------|
| Old | 10°C | 05:00 | 17:00 | 30% |
<!-- End of Hourly Weather Update -->
<em>Last refresh: old time</em>`;

      (Bun as Record<string, unknown>)["file"] = (path: string) => {
        if (String(path).includes(".api-calls")) {
          return {
            exists: () => Promise.resolve(false),
            text: () => Promise.resolve(""),
          };
        }
        return {
          exists: () => Promise.resolve(true),
          text: () => Promise.resolve(mockFileContent),
          size: mockFileContent.length,
        };
      };
      (Bun as Record<string, unknown>)["write"] = () => Promise.resolve(100);

      const { main } = await import("@/weather-update/index");
      await main();

      const allStdout = stdoutCalls.join("");
      expect(allStdout).toContain("CHANGES_DETECTED=true");

      Bun.env["PROFILE_README_PATH"] = originalPath;
      Bun.env["GITHUB_ACTIONS"] = originalGHA;
      (Bun as Record<string, unknown>)["file"] = originalBunFile;
      (Bun as Record<string, unknown>)["write"] = originalBunWrite;
    });

    test("should not emit CHANGES_DETECTED when not in CI", async () => {
      const originalPath = Bun.env["PROFILE_README_PATH"];
      const originalGHA = Bun.env["GITHUB_ACTIONS"];
      Bun.env["PROFILE_README_PATH"] = "";
      Bun.env["GITHUB_ACTIONS"] = "";

      global.fetch = mock(() =>
        Promise.resolve(
          Response.json({
            current: {
              temperature_2m: 25,
              relative_humidity_2m: 60,
              weather_code: 0,
              is_day: 1,
            },
            daily: {
              sunrise: [1_704_153_600],
              sunset: [1_704_196_800],
            },
            utc_offset_seconds: 21_600,
          })
        )
      ) as unknown as typeof fetch;

      const originalBunFile = Bun.file;
      const originalBunWrite = Bun.write;
      const mockFileContent = `# Profile
<!-- Hourly Weather Update -->
| Weather | Temp | Sunrise | Sunset | Humidity |
|---------|------|---------|--------|----------|
| Old | 10°C | 05:00 | 17:00 | 30% |
<!-- End of Hourly Weather Update -->
<em>Last refresh: old time</em>`;

      (Bun as Record<string, unknown>)["file"] = (path: string) => {
        if (String(path).includes(".api-calls")) {
          return {
            exists: () => Promise.resolve(false),
            text: () => Promise.resolve(""),
          };
        }
        return {
          exists: () => Promise.resolve(true),
          text: () => Promise.resolve(mockFileContent),
          size: mockFileContent.length,
        };
      };
      (Bun as Record<string, unknown>)["write"] = () => Promise.resolve(100);

      const { main } = await import("@/weather-update/index");
      await main();

      const allStdout = stdoutCalls.join("");
      expect(allStdout).not.toContain("CHANGES_DETECTED");

      Bun.env["PROFILE_README_PATH"] = originalPath;
      Bun.env["GITHUB_ACTIONS"] = originalGHA;
      (Bun as Record<string, unknown>)["file"] = originalBunFile;
      (Bun as Record<string, unknown>)["write"] = originalBunWrite;
    });

    test("should emit CHANGES_DETECTED=false when no changes detected in CI", async () => {
      const MOCK_API_RESPONSE = {
        current: {
          temperature_2m: 25,
          relative_humidity_2m: 60,
          weather_code: 0,
          is_day: 1,
        },
        daily: {
          sunrise: [1_704_153_600],
          sunset: [1_704_196_800],
        },
        utc_offset_seconds: 21_600,
      };

      global.fetch = mock(() =>
        Promise.resolve(Response.json(MOCK_API_RESPONSE))
      ) as unknown as typeof fetch;

      const originalBunFile = Bun.file;
      const originalBunWrite = Bun.write;
      const originalForceUpdate = Bun.env["FORCE_UPDATE"];
      const originalPath = Bun.env["PROFILE_README_PATH"];
      const originalGHA = Bun.env["GITHUB_ACTIONS"];
      Bun.env["FORCE_UPDATE"] = "false";
      Bun.env["PROFILE_README_PATH"] = "";
      Bun.env["GITHUB_ACTIONS"] = "true";

      // README already has correct content - no weather section markers
      const readmeWithNoSection = "# Profile\nNo weather section here";

      (Bun as Record<string, unknown>)["file"] = (path: string) => {
        if (String(path).includes(".api-calls")) {
          return {
            exists: () => Promise.resolve(false),
            text: () => Promise.resolve(""),
          };
        }
        return {
          exists: () => Promise.resolve(true),
          text: () => Promise.resolve(readmeWithNoSection),
          size: readmeWithNoSection.length,
        };
      };
      (Bun as Record<string, unknown>)["write"] = () => Promise.resolve(0);

      const { main } = await import("@/weather-update/index");
      await main();

      const allStdout = stdoutCalls.join("");
      expect(allStdout).toContain("CHANGES_DETECTED=false");

      Bun.env["FORCE_UPDATE"] = originalForceUpdate;
      Bun.env["PROFILE_README_PATH"] = originalPath;
      Bun.env["GITHUB_ACTIONS"] = originalGHA;
      (Bun as Record<string, unknown>)["file"] = originalBunFile;
      (Bun as Record<string, unknown>)["write"] = originalBunWrite;
    });
  });

  describe("custom README path handling", () => {
    test("should accept valid .md custom path", async () => {
      const originalPath = Bun.env["PROFILE_README_PATH"];
      Bun.env["PROFILE_README_PATH"] = "profile-repo/README.md";

      const MOCK_API_RESPONSE = {
        current: {
          temperature_2m: 25,
          relative_humidity_2m: 60,
          weather_code: 0,
          is_day: 1,
        },
        daily: {
          sunrise: [1_704_153_600],
          sunset: [1_704_196_800],
        },
        utc_offset_seconds: 21_600,
      };

      global.fetch = mock(() =>
        Promise.resolve(Response.json(MOCK_API_RESPONSE))
      ) as unknown as typeof fetch;

      const originalBunFile = Bun.file;
      const originalBunWrite = Bun.write;
      const mockFileContent = `# Profile
<!-- Hourly Weather Update -->
| Weather | Temp | Sunrise | Sunset | Humidity |
|---------|------|---------|--------|----------|
| Old | 10°C | 05:00 | 17:00 | 30% |
<!-- End of Hourly Weather Update -->
<em>Last refresh: old time</em>`;

      (Bun as Record<string, unknown>)["file"] = (path: string) => {
        if (String(path).includes(".api-calls")) {
          return {
            exists: () => Promise.resolve(false),
            text: () => Promise.resolve(""),
          };
        }
        return {
          exists: () => Promise.resolve(true),
          text: () => Promise.resolve(mockFileContent),
          size: mockFileContent.length,
        };
      };
      (Bun as Record<string, unknown>)["write"] = () => Promise.resolve(100);

      const { main } = await import("@/weather-update/index");
      await main();

      const allOutput = [...stdoutCalls, ...stderrCalls].join("");
      expect(allOutput).toContain("readme=profile-repo/README.md");

      Bun.env["PROFILE_README_PATH"] = originalPath;
      (Bun as Record<string, unknown>)["file"] = originalBunFile;
      (Bun as Record<string, unknown>)["write"] = originalBunWrite;
    });
  });

  describe("createErrorInfo (via error handling)", () => {
    test("should include stack trace when Error is thrown", async () => {
      global.fetch = mock(() =>
        Promise.reject(new Error("API connection failed"))
      ) as unknown as typeof fetch;

      const originalBunFile = Bun.file;
      const originalBunWrite = Bun.write;
      (Bun as Record<string, unknown>)["file"] = (path: string) => {
        if (String(path).includes(".api-calls")) {
          return {
            exists: () => Promise.resolve(false),
            text: () => Promise.resolve(""),
          };
        }
        return originalBunFile(path);
      };
      (Bun as Record<string, unknown>)["write"] = () => Promise.resolve(0);

      const { main } = await import("@/weather-update/index");
      await expect(main()).rejects.toThrow("API connection failed");

      const allOutput = [...stdoutCalls, ...stderrCalls].join("");
      expect(allOutput).toContain("API connection failed");

      (Bun as Record<string, unknown>)["file"] = originalBunFile;
      (Bun as Record<string, unknown>)["write"] = originalBunWrite;
    });

    test("should handle non-Error thrown values", async () => {
      global.fetch = mock(() =>
        Promise.reject("string error")
      ) as unknown as typeof fetch;

      const originalBunFile = Bun.file;
      const originalBunWrite = Bun.write;
      (Bun as Record<string, unknown>)["file"] = (path: string) => {
        if (String(path).includes(".api-calls")) {
          return {
            exists: () => Promise.resolve(false),
            text: () => Promise.resolve(""),
          };
        }
        return originalBunFile(path);
      };
      (Bun as Record<string, unknown>)["write"] = () => Promise.resolve(0);

      const { main } = await import("@/weather-update/index");
      await expect(main()).rejects.toBe("string error");

      (Bun as Record<string, unknown>)["file"] = originalBunFile;
      (Bun as Record<string, unknown>)["write"] = originalBunWrite;
    });
  });

  describe("handleFatalError", () => {
    test("should log fatal message and call process.exit", async () => {
      const originalExit = process.exit;
      let exitCode: number | undefined;
      process.exit = ((code: number) => {
        exitCode = code;
      }) as typeof process.exit;

      const { handleFatalError } = await import("@/weather-update/index");
      handleFatalError(new Error("crash test"));

      const allOutput = [...stdoutCalls, ...stderrCalls].join("");
      expect(allOutput).toContain("Fatal: crash test");
      expect(exitCode).toBe(1);

      process.exit = originalExit;
    });

    test("should handle non-Error values", async () => {
      const originalExit = process.exit;
      let exitCode: number | undefined;
      process.exit = ((code: number) => {
        exitCode = code;
      }) as typeof process.exit;

      const { handleFatalError } = await import("@/weather-update/index");
      handleFatalError("string crash");

      const allOutput = [...stdoutCalls, ...stderrCalls].join("");
      expect(allOutput).toContain("Fatal: string crash");
      expect(exitCode).toBe(1);

      process.exit = originalExit;
    });
  });
});
