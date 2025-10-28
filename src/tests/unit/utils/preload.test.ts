/**
 * Tests for preload.ts: rate limit tracking and env validation behavior.
 * Covers success, failure, and edge cases.
 */

import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import {
  checkAndUpdateApiLimit,
  ensureEnvironmentVariables,
  validateEnvironmentVariables,
} from "@/weather-update/utils/preload";

// Test constants & types

// Common values and fixtures used across tests
const TEST_CONSTANTS = {
  // API Key constants
  VALID_API_KEY: "1234567890abcdef1234567890abcdef", // 32 chars
  VALID_API_KEY_LONG:
    "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcde", // 95 chars
  INVALID_API_KEY_SHORT: "1234567890abcdef1234567890abcde", // 31 chars
  INVALID_API_KEY_LONG:
    "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12345", // 101 chars
  INVALID_API_KEY_SPECIAL: "1234567890abcdef1234567890abc@ef", // 32 chars with special char

  // Date constants
  TODAY_DATE: "2024-01-15",
  YESTERDAY_DATE: "2024-01-14",
  TOMORROW_DATE: "2024-01-16",

  // Time constants
  CURRENT_TIME: "14:30",
  LAST_CALL_TIME: "13:45",

  // Rate limiting constants
  MAX_CALLS_PER_DAY: 15,
  TRACKING_FILE: ".api-calls.json",

  // Mock data
  VALID_TRACKING_DATA: {
    date: "2024-01-15",
    calls: 5,
    lastCall: "13:45",
  },
  TRACKING_DATA_WITHOUT_LAST_CALL: {
    date: "2024-01-15",
    calls: 3,
  },
  TRACKING_DATA_LIMIT_REACHED: {
    date: "2024-01-15",
    calls: 15,
    lastCall: "13:45",
  },
  TRACKING_DATA_OLD_DATE: {
    date: "2024-01-14",
    calls: 10,
    lastCall: "23:59",
  },

  // Error messages
  API_LIMIT_EXCEEDED_MESSAGE:
    "API call limit exceeded - cannot proceed with weather update",
  ENVIRONMENT_VALIDATION_FAILED_MESSAGE: "Environment validation failed:",
} as const;

// Test setup & utilities

// Mock global objects
const originalEnv = { ...Bun.env };
const originalBunFile = Bun.file;
const originalBunWrite = Bun.write;
const originalStdoutWrite = process.stdout.write;
const originalStderrWrite = process.stderr.write;

const mockBunFile = mock(originalBunFile);
const mockBunWrite = mock(originalBunWrite);

// Capture console output
let stdoutCalls: string[] = [];
let stderrCalls: string[] = [];

beforeEach(() => {
  // Reset mocks
  mockBunFile.mockClear();
  mockBunWrite.mockClear();
  stdoutCalls = [];
  stderrCalls = [];

  // Set up default mocks
  mockBunFile.mockReturnValue({
    exists: () => Promise.resolve(false),
    text: () => Promise.resolve(""),
  } as any);

  mockBunWrite.mockResolvedValue(0);

  // Override global objects
  Bun.file = mockBunFile as any;
  Bun.write = mockBunWrite as any;

  // Mock console output
  process.stdout.write = (chunk: string) => {
    stdoutCalls.push(chunk);
    return true;
  };

  process.stderr.write = (chunk: string) => {
    stderrCalls.push(chunk);
    return true;
  };

  // Reset environment
  process.env = { ...originalEnv };
});

afterEach(() => {
  // Restore environment
  process.env = originalEnv;

  // Restore global objects
  Bun.file = originalBunFile;
  Bun.write = originalBunWrite;
  process.stdout.write = originalStdoutWrite;
  process.stderr.write = originalStderrWrite;
});

// Helper functions

/** Creates a minimal Bun.file-like mock. */
function createMockFile(
  exists = false,
  content: string = JSON.stringify(TEST_CONSTANTS.VALID_TRACKING_DATA)
) {
  return {
    exists: () => Promise.resolve(exists),
    text: () => Promise.resolve(content),
  };
}

/** Stubs Date for deterministic tests; returns restore function. */
function mockDate(dateString: string) {
  const mockDateInstance = new Date(dateString);
  const OriginalDate = global.Date;

  // Create a custom Date class that returns our mocked date
  const MockDate = function (this: any, ...args: any[]) {
    if (args.length === 0) {
      return mockDateInstance;
    }
    const [year, month, ...rest] = args;
    return new OriginalDate(year, month, ...rest);
  } as any;

  MockDate.now = () => mockDateInstance.getTime();
  MockDate.prototype = OriginalDate.prototype;

  global.Date = MockDate;

  return () => {
    global.Date = OriginalDate;
  };
}

// ================================
// 🧪 Test Suites
// ================================

describe("checkAndUpdateApiLimit", () => {
  test("should allow API call when under limit", async () => {
    // Setup
    const mockFile = createMockFile(
      true,
      JSON.stringify(TEST_CONSTANTS.VALID_TRACKING_DATA)
    );
    mockBunFile.mockReturnValue(mockFile as any);
    const restoreDate = mockDate("2024-01-15T14:30:00Z");

    try {
      // Execute
      const result = await checkAndUpdateApiLimit();

      // Verify
      expect(result).toBeTrue();
      expect(mockBunWrite).toHaveBeenCalledTimes(1);
      expect(stdoutCalls).toContain("📊 API call 6/15 (9 remaining today)\n");
    } finally {
      restoreDate();
    }
  });

  test("should reject API call when limit exceeded", async () => {
    // Setup
    const mockFile = createMockFile(
      true,
      JSON.stringify(TEST_CONSTANTS.TRACKING_DATA_LIMIT_REACHED)
    );
    mockBunFile.mockReturnValue(mockFile as any);
    const restoreDate = mockDate("2024-01-15T14:30:00Z");

    try {
      // Execute
      const result = await checkAndUpdateApiLimit();

      // Verify
      expect(result).toBeFalse();
      expect(mockBunWrite).not.toHaveBeenCalled();
      expect(
        stderrCalls.some((call) => call.includes("❌ API call limit exceeded!"))
      ).toBeTrue();
      expect(
        stderrCalls.some((call) => call.includes("📅 Date: 2024-01-15"))
      ).toBeTrue();
      expect(
        stderrCalls.some((call) => call.includes("📊 Calls made: 15"))
      ).toBeTrue();
      expect(
        stderrCalls.some((call) => call.includes("⏰ Last call: 13:45"))
      ).toBeTrue();
      expect(
        stderrCalls.some((call) =>
          call.includes("🔄 Counter resets at 00:00 UTC")
        )
      ).toBeTrue();
    } finally {
      restoreDate();
    }
  });

  test("should start fresh when tracking file doesn't exist", async () => {
    // Setup
    const mockFile = createMockFile(false);
    mockBunFile.mockReturnValue(mockFile as any);
    const restoreDate = mockDate("2024-01-15T14:30:00Z");

    try {
      // Execute
      const result = await checkAndUpdateApiLimit();

      // Verify
      expect(result).toBeTrue();
      expect(mockBunWrite).toHaveBeenCalledTimes(1);
      expect(stdoutCalls).toContain("📊 API call 1/15 (14 remaining today)\n");
    } finally {
      restoreDate();
    }
  });

  test("should start fresh when tracking file is invalid", async () => {
    // Setup
    const mockFile = createMockFile(true, "invalid json");
    mockBunFile.mockReturnValue(mockFile as any);
    const restoreDate = mockDate("2024-01-15T14:30:00Z");

    try {
      // Execute
      const result = await checkAndUpdateApiLimit();

      // Verify
      expect(result).toBeTrue();
      expect(
        stdoutCalls.some((call) =>
          call.includes(
            "⚠️ API tracking file invalid or missing, starting fresh"
          )
        )
      ).toBeTrue();
      expect(mockBunWrite).toHaveBeenCalledTimes(1);
    } finally {
      restoreDate();
    }
  });

  test("should reset counter when date changes", async () => {
    // Setup
    const mockFile = createMockFile(
      true,
      JSON.stringify(TEST_CONSTANTS.TRACKING_DATA_OLD_DATE)
    );
    mockBunFile.mockReturnValue(mockFile as any);
    const restoreDate = mockDate("2024-01-15T14:30:00Z"); // Different day

    try {
      // Execute
      const result = await checkAndUpdateApiLimit();

      // Verify
      expect(result).toBeTrue();
      expect(mockBunWrite).toHaveBeenCalledTimes(1);
      expect(stdoutCalls).toContain("📊 API call 1/15 (14 remaining today)\n");
    } finally {
      restoreDate();
    }
  });

  test("should handle file read error gracefully", async () => {
    // Setup
    const mockFile = {
      exists: () => Promise.resolve(true),
      text: () => Promise.reject(new Error("File read error")),
    };
    mockBunFile.mockReturnValue(mockFile as any);
    const restoreDate = mockDate("2024-01-15T14:30:00Z");

    try {
      // Execute
      const result = await checkAndUpdateApiLimit();

      // Verify
      expect(result).toBeTrue();
      expect(
        stdoutCalls.some((call) =>
          call.includes(
            "⚠️ API tracking file invalid or missing, starting fresh"
          )
        )
      ).toBeTrue();
      expect(mockBunWrite).toHaveBeenCalledTimes(1);
    } finally {
      restoreDate();
    }
  });

  test("should handle file write error gracefully", async () => {
    // Setup
    const mockFile = createMockFile(
      true,
      JSON.stringify(TEST_CONSTANTS.VALID_TRACKING_DATA)
    );
    mockBunFile.mockReturnValue(mockFile as any);
    mockBunWrite.mockRejectedValue(new Error("Write error"));
    const restoreDate = mockDate("2024-01-15T14:30:00Z");

    try {
      // Execute
      const result = await checkAndUpdateApiLimit();

      // Verify
      expect(result).toBeTrue();
      expect(
        stderrCalls.some((call) =>
          call.includes(
            "❌ Failed to save API call tracking: Error: Write error"
          )
        )
      ).toBeTrue();
    } finally {
      restoreDate();
    }
  });
});

describe("validateEnvironmentVariables", () => {
  test("should validate valid API key", () => {
    // Setup
    Bun.env["OPEN_WEATHER_KEY"] = TEST_CONSTANTS.VALID_API_KEY;

    // Execute
    const result = validateEnvironmentVariables();

    // Verify
    expect(result.OPEN_WEATHER_KEY).toBe(TEST_CONSTANTS.VALID_API_KEY);
    expect(
      stdoutCalls.some((call) =>
        call.includes("🔍 Environment variable check:")
      )
    ).toBeTrue();
    expect(
      stdoutCalls.some((call) => call.includes("OPEN_WEATHER_KEY exists: true"))
    ).toBeTrue();
    expect(
      stdoutCalls.some((call) => call.includes("OPEN_WEATHER_KEY length: 32"))
    ).toBeTrue();
    expect(
      stdoutCalls.some((call) =>
        call.includes("OPEN_WEATHER_KEY preview: 12345678...")
      )
    ).toBeTrue();
  });

  test("should validate valid long API key", () => {
    // Setup
    Bun.env["OPEN_WEATHER_KEY"] = TEST_CONSTANTS.VALID_API_KEY_LONG;

    // Execute
    const result = validateEnvironmentVariables();

    // Verify
    expect(result.OPEN_WEATHER_KEY).toBe(TEST_CONSTANTS.VALID_API_KEY_LONG);
    expect(
      stdoutCalls.some((call) => call.includes("OPEN_WEATHER_KEY length: 95"))
    ).toBeTrue();
  });

  test("should handle API key with whitespace", () => {
    // Setup
    Bun.env["OPEN_WEATHER_KEY"] = `  ${TEST_CONSTANTS.VALID_API_KEY}  `;

    // Execute
    const result = validateEnvironmentVariables();

    // Verify
    expect(result.OPEN_WEATHER_KEY).toBe(TEST_CONSTANTS.VALID_API_KEY);
  });

  test("should throw error for missing API key", () => {
    // Setup
    Bun.env["OPEN_WEATHER_KEY"] = undefined;

    // Execute & Verify
    expect(() => validateEnvironmentVariables()).toThrow(
      TEST_CONSTANTS.ENVIRONMENT_VALIDATION_FAILED_MESSAGE
    );
  });

  test("should throw error for empty API key", () => {
    // Setup
    Bun.env["OPEN_WEATHER_KEY"] = "";

    // Execute & Verify
    expect(() => validateEnvironmentVariables()).toThrow(
      TEST_CONSTANTS.ENVIRONMENT_VALIDATION_FAILED_MESSAGE
    );
  });

  test("should throw error for API key that's too short", () => {
    // Setup
    Bun.env["OPEN_WEATHER_KEY"] = TEST_CONSTANTS.INVALID_API_KEY_SHORT;

    // Execute & Verify
    expect(() => validateEnvironmentVariables()).toThrow(
      TEST_CONSTANTS.ENVIRONMENT_VALIDATION_FAILED_MESSAGE
    );
    expect(() => validateEnvironmentVariables()).toThrow(
      "API key must be at least 32 characters"
    );
  });

  test("should throw error for API key that's too long", () => {
    // Setup
    Bun.env["OPEN_WEATHER_KEY"] = TEST_CONSTANTS.INVALID_API_KEY_LONG;

    // Execute & Verify
    expect(() => validateEnvironmentVariables()).toThrow(
      TEST_CONSTANTS.ENVIRONMENT_VALIDATION_FAILED_MESSAGE
    );
    expect(() => validateEnvironmentVariables()).toThrow(
      "API key must be less than 100 characters"
    );
  });

  test("should throw error for API key with special characters", () => {
    // Setup
    Bun.env["OPEN_WEATHER_KEY"] = TEST_CONSTANTS.INVALID_API_KEY_SPECIAL;

    // Execute & Verify
    expect(() => validateEnvironmentVariables()).toThrow(
      TEST_CONSTANTS.ENVIRONMENT_VALIDATION_FAILED_MESSAGE
    );
    expect(() => validateEnvironmentVariables()).toThrow(
      "API key must contain only alphanumeric characters"
    );
  });

  test("should include setup instructions in error message", () => {
    // Setup
    Bun.env["OPEN_WEATHER_KEY"] = "";

    // Execute & Verify
    expect(() => validateEnvironmentVariables()).toThrow(
      "📋 Setup Instructions:"
    );
    expect(() => validateEnvironmentVariables()).toThrow(
      "Create a .env file in your project root"
    );
    expect(() => validateEnvironmentVariables()).toThrow(
      "Add your OpenWeather API key: OPEN_WEATHER_KEY=your_api_key_here"
    );
  });
});

describe("ensureEnvironmentVariables", () => {
  test("should succeed when API limit allows and environment is valid", async () => {
    // Setup
    Bun.env["OPEN_WEATHER_KEY"] = TEST_CONSTANTS.VALID_API_KEY;
    const mockFile = createMockFile(
      true,
      JSON.stringify(TEST_CONSTANTS.VALID_TRACKING_DATA)
    );
    mockBunFile.mockReturnValue(mockFile as any);
    const restoreDate = mockDate("2024-01-15T14:30:00Z");

    try {
      // Execute
      const result = await ensureEnvironmentVariables();

      // Verify
      expect(result.OPEN_WEATHER_KEY).toBe(TEST_CONSTANTS.VALID_API_KEY);
      expect(mockBunWrite).toHaveBeenCalledTimes(1);
    } finally {
      restoreDate();
    }
  });

  test("should throw error when API limit is exceeded", async () => {
    // Setup
    Bun.env["OPEN_WEATHER_KEY"] = TEST_CONSTANTS.VALID_API_KEY;
    const mockFile = createMockFile(
      true,
      JSON.stringify(TEST_CONSTANTS.TRACKING_DATA_LIMIT_REACHED)
    );
    mockBunFile.mockReturnValue(mockFile as any);
    const restoreDate = mockDate("2024-01-15T14:30:00Z");

    try {
      // Execute & Verify
      await expect(ensureEnvironmentVariables()).rejects.toThrow(
        TEST_CONSTANTS.API_LIMIT_EXCEEDED_MESSAGE
      );
    } finally {
      restoreDate();
    }
  });

  test("should throw error when environment validation fails", async () => {
    // Setup
    Bun.env["OPEN_WEATHER_KEY"] = "";
    const mockFile = createMockFile(
      true,
      JSON.stringify(TEST_CONSTANTS.VALID_TRACKING_DATA)
    );
    mockBunFile.mockReturnValue(mockFile as any);
    const restoreDate = mockDate("2024-01-15T14:30:00Z");

    try {
      // Execute & Verify
      await expect(ensureEnvironmentVariables()).rejects.toThrow(
        TEST_CONSTANTS.ENVIRONMENT_VALIDATION_FAILED_MESSAGE
      );
    } finally {
      restoreDate();
    }
  });
});
