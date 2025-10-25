#!/usr/bin/env bun

/**
 * Modern Development Workflow Script - 2025 Standards
 * Provides clean, fast, and intuitive development commands
 */

import { existsSync } from "node:fs";
import { $ } from "bun";

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

async function runDev() {
  console.log("🚀 Starting development server...");
  await $`bun run src/weather-update/index.ts`;
}

async function runTests() {
  console.log("🧪 Running tests...");
  await $`bun run test:fast`;
}

async function runTestsWatch() {
  console.log("👀 Running tests in watch mode...");
  await $`bun run test:watch`;
}

async function runTestsCoverage() {
  console.log("📊 Running tests with coverage...");
  await $`bun run test:coverage`;
}

async function runFormat() {
  console.log("✨ Formatting code...");
  await $`bun run format`;
}

async function runLint() {
  console.log("🔍 Linting code...");
  await $`bun run lint`;
}

async function runTypeCheck() {
  console.log("🔧 Type checking...");
  await $`bun run type-check`;
}

async function runFullCheck() {
  console.log("🔍 Running full quality check...");
  console.log("  • Type checking...");
  await $`bun run type-check`;
  console.log("  • Linting...");
  await $`bun run lint`;
  console.log("  • Testing...");
  await $`bun run test:fast`;
  console.log("✅ All checks passed!");
}

async function runClean() {
  console.log("🧹 Cleaning project...");
  if (existsSync("dist")) {
    await $`rm -rf dist`;
    console.log("  • Removed dist/");
  }
  if (existsSync("node_modules/.cache")) {
    await $`rm -rf node_modules/.cache`;
    console.log("  • Cleared cache");
  }
  console.log("✅ Project cleaned!");
}

async function runSetup() {
  console.log("⚙️  Setting up development environment...");
  console.log("  • Installing dependencies...");
  await $`bun install`;
  console.log("  • Installing git hooks...");
  await $`lefthook install`;
  console.log("  • Running initial checks...");
  await runFullCheck();
  console.log("✅ Setup complete!");
}

async function runStatus() {
  console.log("📊 Project Status");
  console.log("==================");

  // Git status
  const gitStatus = await $`git status --porcelain`.text();
  if (gitStatus.trim()) {
    console.log("📝 Uncommitted changes:");
    console.log(gitStatus);
  } else {
    console.log("✅ Working directory clean");
  }

  // Test status
  console.log("\n🧪 Running quick test check...");
  try {
    await $`bun run test:quiet`;
    console.log("✅ All tests passing");
  } catch {
    console.log("❌ Some tests failing");
  }

  // Type check
  console.log("\n🔧 Type check...");
  try {
    await $`bun run type-check`;
    console.log("✅ TypeScript checks passed");
  } catch {
    console.log("❌ TypeScript errors found");
  }
}

function showHelp() {
  console.log(`
🎯 Modern Development Workflow - 2025 Standards

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

async function main() {
  const command = process.argv[2] as Command;

  if (!command || command === "help") {
    showHelp();
    return;
  }

  if (!(command in commands)) {
    console.error(`❌ Unknown command: ${command}`);
    showHelp();
    process.exit(1);
  }

  try {
    await commands[command]();
  } catch (error) {
    console.error(`❌ Command failed: ${error}`);
    process.exit(1);
  }
}

main();
