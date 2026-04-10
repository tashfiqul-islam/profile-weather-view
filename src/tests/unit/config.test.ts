/**
 * Tests for config.ts: Verifies shared configuration constants.
 */

import { describe, expect, test } from "bun:test";
import { DISPLAY_TIMEZONE } from "@/weather-update/config";

describe("config", () => {
  test("should export DISPLAY_TIMEZONE as Asia/Dhaka", () => {
    expect(DISPLAY_TIMEZONE).toBe("Asia/Dhaka");
  });

  test("should export DISPLAY_TIMEZONE as a readonly string", () => {
    expect(typeof DISPLAY_TIMEZONE).toBe("string");
    expect(DISPLAY_TIMEZONE.length).toBeGreaterThan(0);
  });
});
