/*
 * Developer Experience CLI (DX CLI)
 * - Modern, sleek, 2025-style terminal UI for common project tasks
 * - Colorized dashboard, concise summaries, and helpful timings
 * - Commands: dashboard (default), test, lint, typecheck, renovate, deps, sync, weather, workflows
 */

/* Formatting & Color Utilities */
const BANNER_WIDTH = 66;
const LABEL_PAD = 22;

const ANSI = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  italic: "\x1b[3m",
  underline: "\x1b[4m",
  inverse: "\x1b[7m",
  black: "\x1b[30m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  gray: "\x1b[90m",
};

function color(text: string, c: keyof typeof ANSI): string {
  return `${ANSI[c]}${text}${ANSI.reset}`;
}

function pad(str: string, len: number): string {
  return str.length >= len ? str.slice(0, len) : str.padEnd(len, " ");
}

function hr(char = "─", width = 60): string {
  return char.repeat(width);
}

function banner(title: string): void {
  const line = hr("═", BANNER_WIDTH);
  console.log(color(line, "blue"));
  console.log(color(`  ${title}`, "cyan"));
  console.log(color(line, "blue"));
}

/* Process Utilities */
type RunResult = {
  readonly code: number;
  readonly stdout: string;
  readonly stderr: string;
  readonly ms: number;
};

async function run(
  command: string,
  args: string[] = [],
  opts: { quiet?: boolean } = {}
): Promise<RunResult> {
  const start = performance.now();
  const proc = Bun.spawn({
    cmd: [command, ...args],
    stdout: "pipe",
    stderr: "pipe",
  });
  const [stdout, stderr] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ]);
  const code = await proc.exited;
  const ms = performance.now() - start;
  if (!opts.quiet) {
    const status = code === 0 ? color("✔", "green") : color("✖", "red");
    console.log(
      `${status} ${color(command, "bold")} ${args.join(" ")} ${color(`(${ms.toFixed(0)}ms)`, "gray")}`
    );
  }
  return { code, stdout, stderr, ms };
}

function section(title: string): void {
  console.log(`\n${color(`▶ ${title}`, "magenta")}`);
  console.log(color(hr(), "gray"));
}

function resultRow(
  label: string,
  value: string,
  status?: "ok" | "warn" | "err"
): void {
  let statusIcon = color("●", "blue");
  if (status === "ok") {
    statusIcon = color("●", "green");
  } else if (status === "warn") {
    statusIcon = color("●", "yellow");
  } else if (status === "err") {
    statusIcon = color("●", "red");
  }
  console.log(`${statusIcon} ${pad(`${label}:`, LABEL_PAD)} ${value}`);
}

/* Task Runners */
async function showDashboard(): Promise<number> {
  banner("Profile Weather View · DX CLI");

  // Environment
  section("Environment");
  const bun = await run("bun", ["--version"], { quiet: true });
  const node = await run("node", ["--version"], { quiet: true });
  const bunVer = bun.stdout.trim() || "N/A";
  const nodeVer = node.stdout.trim() || "N/A";
  resultRow("Bun", bunVer, bun.code === 0 ? "ok" : "warn");
  resultRow("Node", nodeVer, node.code === 0 ? "ok" : "warn");

  // Git
  section("Git Status");
  const gitBranch = await run("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
    quiet: true,
  });
  const gitDiff = await run("git", ["status", "--porcelain"], { quiet: true });
  const changed = gitDiff.stdout.split("\n").filter(Boolean).length;
  resultRow("Branch", gitBranch.stdout.trim() || "-", "ok");
  resultRow("Changed Files", String(changed), changed === 0 ? "ok" : "warn");

  // Quick Quality (fast checks)
  section("Quick Quality");
  const type = await run("bun", ["run", "type-check"], { quiet: true });
  resultRow(
    "Type Check",
    type.code === 0 ? color("OK", "green") : color("Fail", "red"),
    type.code === 0 ? "ok" : "err"
  );

  const lint = await run("bun", ["run", "lint:check"], { quiet: true });
  resultRow(
    "Lint",
    lint.code === 0 ? color("OK", "green") : color("Issues", "yellow"),
    lint.code === 0 ? "ok" : "warn"
  );

  // Tests (summary only)
  section("Tests");
  const tests = await run("bun", ["run", "test:ci"], { quiet: true });
  const passed = tests.code === 0;
  resultRow(
    "Suite",
    passed
      ? color("All passing", "green")
      : color("Attention needed", "yellow"),
    passed ? "ok" : "warn"
  );

  console.log(`\n${color("Hints:", "cyan")}`);
  console.log(
    `  ${color("bun run src/scripts/dev-cli.ts test", "yellow")}  · run full tests`
  );
  console.log(
    `  ${color("bun run src/scripts/dev-cli.ts renovate", "yellow")}  · validate renovate config`
  );
  console.log(
    `  ${color("bun run src/scripts/dev-cli.ts deps", "yellow")}  · validate dependency system`
  );
  console.log(`\n${color(hr("═", BANNER_WIDTH), "blue")}`);
  return 0;
}

async function runTests(): Promise<number> {
  banner("Tests");
  const r = await run("bun", ["run", "test:ci"]);
  return r.code;
}

async function runTypecheck(): Promise<number> {
  banner("Type Check");
  const r = await run("bun", ["run", "type-check"]);
  return r.code;
}

async function runLint(): Promise<number> {
  banner("Lint");
  const r = await run("bun", ["run", "lint:check"]);
  return r.code;
}

async function runRenovateValidate(): Promise<number> {
  banner("Renovate Validation");
  const r = await run("bun", ["run", "renovate:validate"]);
  return r.code;
}

async function runDepsValidate(): Promise<number> {
  banner("Dependency System Validation");
  const r = await run("bun", ["run", "validate-deps"]);
  return r.code;
}

async function runSyncReadme(): Promise<number> {
  banner("Sync README Tech Stack");
  const r = await run("bun", ["run", "sync-readme-tech-stack"]);
  return r.code;
}

async function runWorkflow(): Promise<number> {
  banner("Developer Workflow");
  const r = await run("bun", ["run", "workflow"]);
  return r.code;
}

async function runWeather(): Promise<number> {
  banner("Weather Update (Local)");
  const r = await run("bun", ["run", "src/weather-update/index.ts"]);
  return r.code;
}

/* CLI Routing */
const [, , cmd = "dashboard"] = process.argv;

const routes: Record<string, () => Promise<number>> = {
  dashboard: showDashboard,
  test: runTests,
  typecheck: runTypecheck,
  lint: runLint,
  renovate: runRenovateValidate,
  deps: runDepsValidate,
  sync: runSyncReadme,
  workflow: runWorkflow,
  weather: runWeather,
};

if (!(cmd in routes)) {
  banner("DX CLI – Help");
  console.log(color("Usage:", "cyan"));
  console.log("  bun run src/scripts/dev-cli.ts [command]\n");
  console.log(color("Commands:", "cyan"));
  console.log(
    "  dashboard   · show environment, git, quick quality, tests summary"
  );
  console.log("  test        · run full tests");
  console.log("  typecheck   · run TypeScript type checking");
  console.log("  lint        · run linter checks");
  console.log("  renovate    · validate renovate configuration");
  console.log("  deps        · validate dependency system");
  console.log("  sync        · sync README tech stack section");
  console.log("  workflow    · run developer workflow helper");
  console.log("  weather     · run local weather update");
  process.exit(1);
}

const fn = routes[cmd as keyof typeof routes];
if (!fn) {
  banner("DX CLI – Help");
  console.log(color("Unknown command.", "red"));
  console.log("  bun run src/scripts/dev-cli.ts [command]\n");
  process.exit(1);
}

const exitCode = await fn().catch((err) => {
  console.error(color(`✖ ${String(err)}`, "red"));
  return 1;
});
process.exit(exitCode);

export {};
