/*
 * Pretty Test Runner
 * Wraps bun test to render:
 * - Per-test list (via JUnit)
 * - Coverage table
 * - Compact summary footer
 */

const ANSI = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
  white: "\x1b[37m",
} as const;

const MIN_COVERAGE_PARTS = 3;
const WIDTH_FILE_MIN = 20;
const WIDTH_COL_MIN = 7;
const DEFAULT_BANNER_WIDTH = 66;
const CONTENT_WIDTH_MAX = 100;
const MIN_TERMINAL_WIDTH = 40;
const MAX_TERMINAL_WIDTH = 160;
const MIN_BORDER_PADDING = 1;
const MS_PER_SECOND = 1000;
const BORDER_CHAR = "─";
// Kept for future layout decisions (currently not used)
// const SUMMARY_MIN_WIDTH = 20;

let NO_COLOR = false;
let USE_UNICODE = true;

function c(text: string, code: keyof typeof ANSI) {
  if (NO_COLOR) {
    return text;
  }
  return `${ANSI[code]}${text}${ANSI.reset}`;
}

function dim(text: string) {
  return c(text, "gray");
}

function getTerminalWidth(): number {
  const w =
    typeof process.stdout.columns === "number"
      ? process.stdout.columns
      : DEFAULT_BANNER_WIDTH;
  return Math.max(MIN_TERMINAL_WIDTH, Math.min(MAX_TERMINAL_WIDTH, w));
}

function hr(char = BORDER_CHAR, width = DEFAULT_BANNER_WIDTH) {
  return char.repeat(width);
}

function banner(title: string) {
  // Header centered to a clamped width so it doesn't dwarf content
  const usable = Math.min(getTerminalWidth(), CONTENT_WIDTH_MAX);
  const label = ` ${title} `;
  const left = Math.max(
    MIN_BORDER_PADDING,
    Math.floor((usable - label.length) / 2)
  );
  const right = Math.max(MIN_BORDER_PADDING, usable - label.length - left);
  const line = `${hr(BORDER_CHAR, left)}${label}${hr(BORDER_CHAR, right)}`;
  console.log(c(line, "blue"));
}

type RunResult = { code: number; stdout: string; stderr: string };

// Top-level regex patterns for performance
const NOISY_PATTERNS = [
  /^✅ API request completed .*$/,
  /^⚠️ Retry attempt .*$/,
];
const PASS_RE = /\b\d+ pass\b/;
const FAIL_RE = /\b\d+ fail\b/;
const TOTAL_RE = /Ran .* tests across .* files\./;

async function runBunTestsJUnit(): Promise<RunResult> {
  const proc = Bun.spawn({
    cmd: ["bun", "test", "--reporter=junit"],
    stdout: "pipe",
    stderr: "pipe",
    env: { ...process.env, CI: "true" },
  });
  const [stdout, stderr] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ]);
  const code = await proc.exited;
  return { code, stdout, stderr };
}

const TESTCASE_RE =
  /<testcase\b[^>]*name="([^"]+)"[^>]*time="([^"]+)"[^>]*>([\s\S]*?)<\/testcase>|<testcase\b[^>]*name="([^"]+)"[^>]*time="([^"]+)"[^>]*/g;
const FAILURE_RE = /<failure\b[\s\S]*?<\/failure>/;
// const SUITE_RE = /<testsuite\b[^>]*tests="(\d+)"[^>]*failures="(\d+)"[^>]*time="([\d.]+)"/;

async function runBunTests(
  reporter: "dots" | "spec" = "dots"
): Promise<RunResult> {
  const proc = Bun.spawn({
    cmd: reporter ? ["bun", "test", `--reporter=${reporter}`] : ["bun", "test"],
    stdout: "pipe",
    stderr: "pipe",
    env: {
      ...process.env,
      CI: "true",
    },
  });
  const [stdout, stderr] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ]);
  const code = await proc.exited;
  return { code, stdout, stderr };
}

async function runBunTestsStreaming(reporter: "dots" = "dots") {
  const proc = Bun.spawn({
    cmd: ["bun", "test", `--reporter=${reporter}`],
    stdout: "pipe",
    stderr: "pipe",
    env: { ...process.env, CI: "true" },
  });
  const decoder = new TextDecoder();
  const outLines: string[] = [];
  const handle = async (stream: ReadableStream) => {
    const reader = stream.getReader();
    let pending = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      const text = decoder.decode(value, { stream: true });
      pending += text;
      let idx = pending.indexOf("\n");
      while (idx !== -1) {
        const line = pending.slice(0, idx);
        pending = pending.slice(idx + 1);
        outLines.push(line);
        renderLiveLine(line);
        idx = pending.indexOf("\n");
      }
    }
    if (pending) {
      outLines.push(pending);
      renderLiveLine(pending);
    }
  };
  await Promise.all([handle(proc.stdout), handle(proc.stderr)]);
  const code = await proc.exited;
  return { code, stdout: outLines.join("\n"), stderr: "" } satisfies RunResult;
}

// Predeclare regexes at top-level for performance and lint compliance
const RE_SPEC_PASS = /^\s*✓\s+/;
const RE_SPEC_FAIL = /^\s*[✖×]\s+/;
const RE_RULES = /^\s*─+\s*$/;
const RE_SUITE = /^\s*Test (Suite|File)/i;
const RE_SUMMARY_PASS = /^\s*\d+\s+pass/;
const RE_SUMMARY_FAIL = /^\s*\d+\s+fail/;
const RE_BUN_HEADER = /^bun test v/i;
const DOT_INLINE_THRESHOLD = 10;
const RE_DOTS_INLINE = /[.·]{10,}/;
const RE_SEED = /^--seed=/;
const RE_EXPECT = /^\d+ expect\(\) calls$/;
const RE_COV_BORDER_INLINE = /-{5,}\|/;
const RE_COV_HEADER_INLINE = /File\s*\|\s*% Funcs/i;
const RE_COV_ROW_SEP_INLINE = /[-|\s]{10,}/;
const RE_COV_TABLE_LINE = /(All files|\s*src[\\/].*)\s\|\s*\d/;
const RE_ERROR_LINE = /^error:\s+/i;
const RE_ERROR_PREFIX = /^error:\s+/i;
const RE_FILE_HEADER = /^(?:[A-Za-z]:\\|\/|src[\\/]).*\.test\.ts:\d+/;
const RE_AT_LINE = /^\s*at\s+/;
const RE_FAIL_LINE = /^\(fail\)\s+(.+)$/;

function isFilteredLine(line: string): boolean {
  if (
    RE_BUN_HEADER.test(line) ||
    (line.length >= DOT_INLINE_THRESHOLD && RE_DOTS_INLINE.test(line)) ||
    RE_SEED.test(line) ||
    RE_EXPECT.test(line) ||
    RE_COV_BORDER_INLINE.test(line) ||
    RE_COV_HEADER_INLINE.test(line) ||
    RE_COV_ROW_SEP_INLINE.test(line) ||
    RE_COV_TABLE_LINE.test(line)
  ) {
    return true;
  }
  return false;
}

function renderLiveLine(raw: string) {
  const line = raw.trimEnd();
  if (!line) {
    return;
  }
  if (NOISY_PATTERNS.some((re) => re.test(line))) {
    return;
  }
  if (isFilteredLine(line)) {
    return;
  }

  // Failure aggregation (suppress noisy stack lines and capture concise info)
  if (RE_ERROR_LINE.test(line)) {
    lastErrorMessage = line.replace(RE_ERROR_PREFIX, "").trim();
    return;
  }
  if (RE_FILE_HEADER.test(line)) {
    lastErrorLocation = line.trim();
    return;
  }
  if (RE_AT_LINE.test(line)) {
    return;
  }
  const failMatch = RE_FAIL_LINE.exec(line);
  if (failMatch) {
    const name = failMatch[1] ?? "";
    failures.push({
      name,
      message: lastErrorMessage,
      location: lastErrorLocation,
    });
    lastErrorMessage = "";
    lastErrorLocation = "";
    console.log(`${c("✖", "red")} ${name}`);
    return;
  }
  // Heuristics for spec-like lines
  if (RE_SPEC_PASS.test(line)) {
    // passed test
    const name = line.replace(RE_SPEC_PASS, "").trim();
    console.log(`${c("✔", "green")} ${name}`);
    return;
  }
  if (RE_SPEC_FAIL.test(line)) {
    const name = line.replace(RE_SPEC_FAIL, "").trim();
    console.log(`${c("✖", "red")} ${name}`);
    return;
  }
  if (RE_RULES.test(line)) {
    return;
  }
  if (RE_SUITE.test(line)) {
    console.log(c(line.trim(), "magenta"));
    return;
  }
  if (
    RE_SUMMARY_PASS.test(line) ||
    RE_SUMMARY_FAIL.test(line) ||
    TOTAL_RE.test(line)
  ) {
    // defer summary; will be re-rendered neatly later from buffer
    return;
  }
  // Print other lines dimmed to avoid noise
  console.log(dim(line));
}

type Failure = { name: string; message: string; location: string };
const failures: Failure[] = [];
let lastErrorMessage = "";
let lastErrorLocation = "";

// Per-file live mode (sequential) — opt-in via env PER_FILE_LIVE (default on in TTY)
// Returns null if not run; otherwise returns the aggregate exit code from per-file execution
async function runPerFileLiveIfEnabled(
  forceLive?: boolean,
  globOverride?: string
): Promise<number | null> {
  const liveEnv = process.env["PER_FILE_LIVE"] as string | undefined;
  const wantLiveDefault = liveEnv !== "0"; // default on in TTY
  const wantLive = typeof forceLive === "boolean" ? forceLive : wantLiveDefault;
  const isTty =
    typeof process.stdout.isTTY === "boolean" && process.stdout.isTTY;
  if (!(wantLive && isTty)) {
    return null;
  }
  // Discover test files: prefer PER_FILE_GLOB, else a default glob under src/tests
  const files = ((): string[] => {
    const globEnv =
      globOverride ?? (process.env["PER_FILE_GLOB"] as string | undefined);
    if (globEnv) {
      return globEnv
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    const acc: string[] = [];
    const defaults = [
      "src/tests/**/*.test.ts",
      "src/tests/**/*.test.tsx",
    ] as const;
    for (const g of defaults) {
      for (const p of new Bun.Glob(g).scanSync({ dot: false })) {
        acc.push(p);
      }
    }
    return acc;
  })();
  if (files.length === 0) {
    return null;
  }
  console.log(c("\nLive Trail", "magenta"));
  console.log(c(hr(), "gray"));
  let overallCode = 0;
  for (const f of files) {
    const proc = Bun.spawn({
      cmd: ["bun", "test", f, "--reporter=dots"],
      stdout: "pipe",
      stderr: "pipe",
      env: { ...process.env, CI: "true" },
    });
    const code = await proc.exited;
    const ok = code === 0;
    const name = f.replace(/\\/g, "/");
    console.log(`${ok ? c("✔", "green") : c("✖", "red")} ${name}`);
    if (!ok) {
      overallCode = code;
    }
  }
  // Return code; caller will continue to run unified pass for summary/coverage
  return overallCode;
}

function filterOutput(text: string): string {
  return text
    .split("\n")
    .filter((line) => !NOISY_PATTERNS.some((re) => re.test(line)))
    .join("\n")
    .trim();
}

function parseCoverageRows(
  lines: string[],
  coverageStart: number
): Array<{ file: string; funcs: string; linesPct: string }> {
  const rows: Array<{ file: string; funcs: string; linesPct: string }> = [];
  if (coverageStart < 0) {
    return rows;
  }
  for (let i = coverageStart + 2; i < lines.length; i += 1) {
    const row = lines[i] ?? "";
    if (row.startsWith("--")) {
      break;
    }
    if (!row.trim()) {
      continue;
    }
    const parts = row.split("|").map((s) => s.trim());
    if (parts.length >= MIN_COVERAGE_PARTS) {
      const file = parts[0] ?? "";
      const funcs = parts[1] ?? "";
      const linesPct = parts[2] ?? "";
      rows.push({ file, funcs, linesPct });
    }
  }
  return rows;
}

function extractSummary(text: string) {
  const lines = text.split("\n");
  const coverageStart = lines.findIndex((l) =>
    l.startsWith("---------------------------------------------|")
  );
  const coverageTable =
    coverageStart >= 0 ? lines.slice(coverageStart).join("\n").trim() : "";
  const passedLine = lines.find((l) => PASS_RE.test(l)) ?? "";
  const failedLine = lines.find((l) => FAIL_RE.test(l)) ?? "";
  const totalSummary = lines.find((l) => TOTAL_RE.test(l)) ?? "";
  const coverageRows = parseCoverageRows(lines, coverageStart);
  return { coverageTable, passedLine, failedLine, totalSummary, coverageRows };
}

function parseCliArgs(argv: string[]) {
  const args: Record<string, string | boolean> = {};
  const NO_PREFIX_LEN = 5; // length of "--no-"
  for (const raw of argv) {
    if (!raw.startsWith("--")) {
      continue;
    }
    if (raw.startsWith("--no-")) {
      args[raw.slice(NO_PREFIX_LEN)] = false;
      continue;
    }
    const pair = raw.slice(2);
    const eqIndex = pair.indexOf("=");
    if (eqIndex === -1) {
      args[pair] = true;
    } else {
      const key = pair.slice(0, eqIndex);
      const value = pair.slice(eqIndex + 1);
      args[key] = value;
    }
  }
  return args as {
    live?: boolean | string;
    glob?: string | boolean;
    title?: string | boolean;
    json?: boolean | string;
    "no-color"?: boolean | string;
    ascii?: boolean | string;
  };
}

const cli = parseCliArgs(process.argv.slice(2));
// Theme toggles
NO_COLOR =
  (typeof cli["no-color"] === "boolean" ? cli["no-color"] : false) ||
  Boolean(process.env["NO_COLOR"]?.length);
const asciiFlag = typeof cli.ascii === "boolean" ? cli.ascii : false;
USE_UNICODE = !asciiFlag && process.platform !== "win32";
const BOX = USE_UNICODE
  ? {
      tl: "╭",
      tr: "╮",
      bl: "╰",
      br: "╯",
      v: "│",
      h: "─",
      cross: "┼",
      t: "┬",
      b: "┴",
    }
  : ({
      tl: "+",
      tr: "+",
      bl: "+",
      br: "+",
      v: "|",
      h: "-",
      cross: "+",
      t: "+",
      b: "+",
    } as const);
const TITLE =
  (typeof cli.title === "string" ? cli.title : undefined) ??
  (process.env["PRETTY_TEST_TITLE"] as string | undefined) ??
  "Bun Tests";
banner(TITLE);
const liveFlag = typeof cli.live === "boolean" ? cli.live : undefined;
const globFlag = typeof cli.glob === "string" ? cli.glob : undefined;
await runPerFileLiveIfEnabled(liveFlag ?? undefined, globFlag ?? undefined);

const START = Date.now();

const interactive =
  typeof process.stdout.isTTY === "boolean" && process.stdout.isTTY;
let junit: RunResult | null = null;
let result: RunResult;
if (interactive) {
  // Live streaming with supported dots reporter
  result = await runBunTestsStreaming("dots");
} else {
  // Non-interactive fallback: capture and pretty print afterwards
  junit = await runBunTestsJUnit();
  result = await runBunTests("dots");
}
const combined = `${result.stdout}\n${result.stderr}`.trimEnd();
const cleaned = filterOutput(combined);
const summary = extractSummary(cleaned);

// Optional machine-readable output
if (cli.json === true) {
  const payload = {
    interactive,
    code: result.code,
    summary: {
      passedLine: summary.passedLine,
      failedLine: summary.failedLine,
      totalSummary: summary.totalSummary,
    },
    coverageRows: summary.coverageRows,
  } as const;
  console.log(JSON.stringify(payload));
  console.log("");
  process.exit(result.code);
}

// Parse JUnit only when available (non-interactive path)
const testsPassed: Array<{ name: string; time: string }> = [];
const testsFailed: Array<{ name: string; time: string }> = [];
if (junit) {
  let match: RegExpExecArray | null;
  while (true) {
    match = TESTCASE_RE.exec(junit.stdout);
    if (match === null) {
      break;
    }
    const name = match[1] ?? match[4] ?? "";
    const time = match[2] ?? match[5] ?? "0";
    const body = match[3] ?? "";
    if (name) {
      if (FAILURE_RE.test(body)) {
        testsFailed.push({ name, time });
      } else {
        testsPassed.push({ name, time });
      }
    }
  }
}

if (!interactive) {
  console.log(c("\nTests", "magenta"));
  console.log(c(hr(), "gray"));
  if (testsPassed.length + testsFailed.length > 0) {
    for (const t of testsPassed) {
      console.log(`${c("✔", "green")} ${t.name} ${dim(`(${t.time}s)`)}`);
    }
    for (const t of testsFailed) {
      console.log(`${c("✖", "yellow")} ${t.name} ${dim(`(${t.time}s)`)}`);
    }
  } else if (summary.coverageRows.length > 0) {
    for (const r of summary.coverageRows) {
      console.log(`${c("✔", "green")} ${r.file}`);
    }
  }
}

// Coverage table (if present)
if (summary.coverageRows.length > 0) {
  console.log(`\n${c("Coverage Report", "magenta")}`);
  const rows = summary.coverageRows;
  const headers = ["File", "% Funcs", "% Lines"];
  const fileW = Math.max(
    WIDTH_FILE_MIN,
    ...rows.map((r) => r.file.length),
    headers[0]?.length ?? 0
  );
  const funcsW = Math.max(
    WIDTH_COL_MIN,
    ...rows.map((r) => r.funcs.length),
    headers[1]?.length ?? 0
  );
  const linesW = Math.max(
    WIDTH_COL_MIN,
    ...rows.map((r) => r.linesPct.length),
    headers[2]?.length ?? 0
  );
  const padEnd = (s: string, w: number) =>
    s.length < w ? s + " ".repeat(w - s.length) : s.slice(0, w);
  const top = `${BOX.tl}${BOX.h.repeat(fileW)}${BOX.t}${BOX.h.repeat(funcsW + 2)}${BOX.t}${BOX.h.repeat(linesW + 2)}${BOX.tr}`;
  const mid = `${USE_UNICODE ? "├" : "+"}${BOX.h.repeat(fileW)}${BOX.cross}${BOX.h.repeat(funcsW + 2)}${BOX.cross}${BOX.h.repeat(linesW + 2)}${USE_UNICODE ? "┤" : "+"}`;
  const bot = `${BOX.bl}${BOX.h.repeat(fileW)}${BOX.b}${BOX.h.repeat(funcsW + 2)}${BOX.b}${BOX.h.repeat(linesW + 2)}${BOX.br}`;
  console.log(c(top, "blue"));
  console.log(
    c(
      `${BOX.v}${padEnd(headers[0] ?? "File", fileW)}${BOX.v} ${padEnd(headers[1] ?? "% Funcs", funcsW)} ${BOX.v} ${padEnd(headers[2] ?? "% Lines", linesW)} ${BOX.v}`,
      "cyan"
    )
  );
  console.log(c(mid, "blue"));
  for (const r of rows) {
    const file = r.file.replace(/^src\\/i, "src/").replace(/\\/g, "/");
    console.log(
      `${BOX.v}${padEnd(file, fileW)}${BOX.v} ${padEnd(r.funcs, funcsW)} ${BOX.v} ${padEnd(r.linesPct, linesW)} ${BOX.v}`
    );
  }
  console.log(c(bot, "blue"));
}

// Summary footer (single-line metric strip)
const parts: string[] = [];
if (summary.passedLine) {
  parts.push(c(summary.passedLine, "green"));
}
if (summary.failedLine) {
  parts.push(c(summary.failedLine, "red"));
}
if (summary.totalSummary) {
  parts.push(c(summary.totalSummary, "cyan"));
}
const elapsedMs = Math.max(0, Date.now() - START);
const elapsed = `${(elapsedMs / MS_PER_SECOND).toFixed(2)}s`;
parts.push(c(`elapsed ${elapsed}`, "yellow"));
if (parts.length) {
  console.log(`\n${c("Summary", "magenta")}`);
  const sep = c("  •  ", "gray");
  const text = ` ${parts.join(sep)} `;
  const ESC = "\u001B";
  const ANSI_RE = new RegExp(`${ESC}\\[[0-9;]*m`, "g");
  const raw = text.replace(ANSI_RE, "");
  const top = `${BOX.tl}${hr(BOX.h, raw.length)}${BOX.tr}`;
  const mid = `${BOX.v}${text}${BOX.v}`;
  const bot = `${BOX.bl}${hr(BOX.h, raw.length)}${BOX.br}`;
  console.log(c(top, "blue"));
  console.log(mid);
  console.log(c(bot, "blue"));
}

// Failure details (compact)
if (failures.length > 0) {
  console.log(`\n${c("Failures", "magenta")}`);
  console.log(c(hr(), "gray"));
  for (const f of failures) {
    const loc = f.location.replace(/\\/g, "/");
    const msg = f.message ? ` — ${dim(f.message)}` : "";
    console.log(`${c("✖", "red")} ${f.name}${msg}`);
    if (loc) {
      console.log(`${dim(loc)}`);
    }
  }
}

console.log("");
process.exit(result.code);

export {};
