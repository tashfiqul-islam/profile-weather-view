/**
 * Tests for logger.ts: Verifies output format, level routing, and timestamp.
 */

import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import type { LogLevel } from "@/weather-update/utils/logger";
import { log } from "@/weather-update/utils/logger";

const TIME_PATTERN = /\d{2}:\d{2}:\d{2}/;

describe("logger", () => {
  const originalStdoutWrite = process.stdout.write;
  const originalStderrWrite = process.stderr.write;
  let stdoutCalls: string[];
  let stderrCalls: string[];

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

  test("should write info messages to stdout", () => {
    log("test info message", "info");
    expect(stdoutCalls.length).toBe(1);
    expect(stderrCalls.length).toBe(0);
    expect(stdoutCalls[0]).toContain("test info message");
  });

  test("should write success messages to stdout", () => {
    log("test success message", "success");
    expect(stdoutCalls.length).toBe(1);
    expect(stderrCalls.length).toBe(0);
    expect(stdoutCalls[0]).toContain("test success message");
  });

  test("should write warning messages to stderr", () => {
    log("test warning message", "warning");
    expect(stderrCalls.length).toBe(1);
    expect(stdoutCalls.length).toBe(0);
    expect(stderrCalls[0]).toContain("test warning message");
  });

  test("should write error messages to stderr", () => {
    log("test error message", "error");
    expect(stderrCalls.length).toBe(1);
    expect(stdoutCalls.length).toBe(0);
    expect(stderrCalls[0]).toContain("test error message");
  });

  test("should default to info level when no level specified", () => {
    log("default level message");
    expect(stdoutCalls.length).toBe(1);
    expect(stderrCalls.length).toBe(0);
  });

  test("should include HH:MM:SS timestamp in output", () => {
    log("timestamp test", "info");
    const output = stdoutCalls[0] ?? "";
    expect(output).toMatch(TIME_PATTERN);
  });

  test("should include the message text in output", () => {
    log("content check", "info");
    const output = stdoutCalls[0] ?? "";
    expect(output).toContain("content check");
  });

  test("should include badge for each level", () => {
    const levels: LogLevel[] = ["info", "success", "warning", "error"];
    const expectedBadges = ["[info]", "[ ok ]", "[warn]", "[fail]"];

    for (const [index, level] of levels.entries()) {
      stdoutCalls = [];
      stderrCalls = [];
      log(`test ${level}`, level);
      const output =
        level === "warning" || level === "error"
          ? (stderrCalls[0] ?? "")
          : (stdoutCalls[0] ?? "");
      expect(output).toContain(expectedBadges[index] ?? "");
    }
  });

  test("should end each log entry with a newline", () => {
    log("newline test", "info");
    const output = stdoutCalls[0] ?? "";
    expect(output.endsWith("\n")).toBe(true);
  });

  test("should format the entry with time, badge, and message", () => {
    log("format check", "success");
    const output = stdoutCalls[0] ?? "";
    expect(output).toContain("[ ok ]");
    expect(output).toContain("format check");
    expect(output).toMatch(TIME_PATTERN);
    expect(output.endsWith("\n")).toBe(true);
  });
});
