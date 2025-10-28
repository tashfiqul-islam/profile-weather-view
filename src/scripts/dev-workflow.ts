#!/usr/bin/env bun

/**
 * Development workflow commands: test, lint, type-check, clean, setup, status.
 * Comments focus on intent and non-obvious behavior.
 */

import { existsSync } from "node:fs";
import { $ } from "bun";

function out(message: string): void {
  process.stdout.write(`${message}\n`);
}

function err(message: string): void {
  process.stderr.write(`${message}\n`);
}

const commands = {
  // Quick development commands
  dev: () => runDev(),
  test: () => runTests(),
  "test:watch": () => runTestsWatch(),
  "test:coverage": () => runTestsCoverage(),
  format: () => runFormat(),
  lint: () => runLint(),
  typecheck: () => runTypeCheck(),
  check: () => runFullCheck(),
  clean: () => runClean(),
  setup: () => runSetup(),
  status: () => runStatus(),
} as const;

type Command = keyof typeof commands | "help";

async function runDev(): Promise<void> {
  out("🚀 Starting development server...");
  await $`bun run src/weather-update/index.ts`;
}

async function runTests(): Promise<void> {
  out("🧪 Running tests...");
  await $`bun run test:fast`;
}

async function runTestsWatch(): Promise<void> {
  out("👀 Running tests in watch mode...");
  await $`bun run test:watch`;
}

async function runTestsCoverage(): Promise<void> {
  out("📊 Running tests with coverage...");
  await $`bun run test:coverage`;
}

async function runFormat(): Promise<void> {
  out("✨ Formatting code...");
  await $`bun run format`;
}

async function runLint(): Promise<void> {
  out("🔍 Linting code...");
  await $`bun run lint`;
}

async function runTypeCheck(): Promise<void> {
  out("🔧 Type checking...");
  await $`bun run type-check`;
}

async function runFullCheck(): Promise<void> {
  out("🔍 Running full quality check...");
  out("  • Type checking...");
  await $`bun run type-check`;
  out("  • Linting...");
  await $`bun run lint`;
  out("  • Testing...");
  await $`bun run test:fast`;
  out("✅ All checks passed!");
}

async function runClean(): Promise<void> {
  out("🧹 Cleaning project...");
  if (existsSync("dist")) {
    await $`rm -rf dist`;
    out("  • Removed dist/");
  }
  if (existsSync("node_modules/.cache")) {
    await $`rm -rf node_modules/.cache`;
    out("  • Cleared cache");
  }
  out("✅ Project cleaned!");
}

async function runSetup(): Promise<void> {
  out("⚙️  Setting up development environment...");
  out("  • Installing dependencies...");
  await $`bun install`;
  out("  • Installing git hooks...");
  await $`lefthook install`;
  out("  • Running initial checks...");
  await runFullCheck();
  out("✅ Setup complete!");
}

async function runStatus(): Promise<void> {
  out("📊 Project Status");
  out("==================");

  // Git status summary
  const gitStatus: string = await $`git status --porcelain`.text();
  if (gitStatus.trim()) {
    out("📝 Uncommitted changes:");
    out(gitStatus);
  } else {
    out("✅ Working directory clean");
  }

  // Quick test status
  out("\n🧪 Running quick test check...");
  try {
    await $`bun run test:quiet`;
    out("✅ All tests passing");
  } catch {
    out("❌ Some tests failing");
  }

  // Type check
  out("\n🔧 Type check...");
  try {
    await $`bun run type-check`;
    out("✅ TypeScript checks passed");
  } catch {
    out("❌ TypeScript errors found");
  }
}

function showHelp(): void {
  out(`
🎯 Development Workflow

Available commands:
  dev          Start development server
  test         Run tests (fast mode)
  test:watch   Run tests in watch mode
  test:coverage Run tests with coverage
  format       Format code
  lint         Lint code
  typecheck    Type check
  check        Run full quality check
  clean        Clean project files
  setup        Setup development environment
  status       Show project status
  help         Show this help

Usage: bun run scripts/dev-workflow.ts <command>

Examples:
  bun run scripts/dev-workflow.ts dev
  bun run scripts/dev-workflow.ts test
  bun run scripts/dev-workflow.ts check
  `);
}

async function main(): Promise<void> {
  const command = process.argv[2] as Command | undefined;

  if (command === undefined || command === "help") {
    showHelp();
    return;
  }

  if (!(command in commands)) {
    err(`❌ Unknown command: ${String(command)}`);
    showHelp();
    process.exitCode = 1;
    return;
  }

  try {
    await commands[command]();
  } catch (error) {
    err(
      `❌ Command failed: ${error instanceof Error ? error.message : String(error)}`
    );
    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  err(
    `❌ Unexpected failure: ${error instanceof Error ? error.message : String(error)}`
  );
  process.exitCode = 1;
});
