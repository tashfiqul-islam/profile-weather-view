/**
 * Tests for preload.ts: rate limit tracking and env validation behavior.
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
  // Date constants
  TODAY_DATE: "2024-01-15",
  YESTERDAY_DATE: "2024-01-14",
  TOMORROW_DATE: "2024-01-16",

  // Time constants
  CURRENT_TIME: "14:30",
  LAST_CALL_TIME: "13:45",

  // Rate limiting constants (updated for Open-Meteo)
  MAX_CALLS_PER_DAY: 1000, // Open-Meteo allows much more
  TRACKING_FILE: ".api-calls.json",

  // Mock data
  VALID_TRACKING_DATA: {
    date: "2024-01-15",
    calls: 500,
    lastCall: "13:45",
  },
  TRACKING_DATA_WITHOUT_LAST_CALL: {
    date: "2024-01-15",
    calls: 300,
  },
  TRACKING_DATA_LIMIT_REACHED: {
    date: "2024-01-15",
    calls: 1000, // Updated for new limit
    lastCall: "13:45",
  },
  TRACKING_DATA_OLD_DATE: {
    date: "2024-01-14",
    calls: 800,
    lastCall: "23:59",
  },

  // Error messages
  API_LIMIT_EXCEEDED_MESSAGE:
    "API call limit exceeded - cannot proceed with weather update",
} as const;

// Test setup & utilities

// Mock global objects
const originalEnv = { ...Bun.env };
const originalBunFile = Bun.file;
const originalBunWrite = Bun.write;
const originalLog = console.log;
const originalError = console.error;

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
  console.log = (chunk: string) => {
    stdoutCalls.push(chunk);
  };

  console.error = (chunk: string) => {
    stderrCalls.push(chunk);
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
  console.log = originalLog;
  console.error = originalError;
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
      expect(stdoutCalls).toContain(
        "📊 API call 501/1000 (499 remaining today)"
      );
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
        stderrCalls.some((call) => call.includes("📊 Calls made: 1000"))
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
      expect(stdoutCalls).toContain("📊 API call 1/1000 (999 remaining today)");
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
      expect(stdoutCalls).toContain("📊 API call 1/1000 (999 remaining today)");
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
  test("should validate successfully and log debug info", () => {
    Bun.env["FORCE_UPDATE"] = "true";

    // Execute
    const result = validateEnvironmentVariables();

    // Verify
    expect(result).toBeDefined();
    expect(result.FORCE_UPDATE).toBe("true");

    // Check if debug intro was logged (covers line 163)
    expect(
      stdoutCalls.some((call) => call.includes("🔍 Environment check:"))
    ).toBeTrue();

    // Verify variable logging
    expect(
      stdoutCalls.some((call) => call.includes("FORCE_UPDATE: true"))
    ).toBeTrue();
  });

  test("should handle missing FORCE_UPDATE gracefully", () => {
    Bun.env["FORCE_UPDATE"] = "";

    // Execute
    const result = validateEnvironmentVariables();

    expect(result).toBeDefined();
    expect(result.FORCE_UPDATE).toBe("");
  });

  test("should detect GitHub Actions environment", () => {
    Bun.env["GITHUB_ACTIONS"] = "true";

    // Execute
    const result = validateEnvironmentVariables();

    // Verify
    expect(result.GITHUB_ACTIONS).toBe("true");
    expect(
      stdoutCalls.some((call) => call.includes("GITHUB_ACTIONS: true"))
    ).toBeTrue();
  });
});

describe("ensureEnvironmentVariables", () => {
  test("should succeed when API limit allows", async () => {
    // Setup
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
      expect(result).toBeDefined();
      expect(mockBunWrite).toHaveBeenCalledTimes(1);
    } finally {
      restoreDate();
    }
  });

  test("should throw error when API limit is exceeded", async () => {
    // Setup
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
});
