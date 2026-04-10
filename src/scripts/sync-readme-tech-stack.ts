/**
 * Sync README Tech Stack Badges
 *
 * Updates version badges in README.md based on package.json dependencies
 * and refreshes the footer timestamp.
 *
 * @module sync-readme-tech-stack
 */

import { join } from "node:path";
import { Temporal } from "@js-temporal/polyfill";
import { z } from "zod";
import { DISPLAY_TIMEZONE } from "../weather-update/config";
import { log } from "../weather-update/utils/logger";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface PackageJson {
  readonly dependencies?: Readonly<Record<string, string>>;
  readonly devDependencies?: Readonly<Record<string, string>>;
  readonly engines?: Readonly<Record<string, string>>;
  readonly packageManager?: string;
  readonly version: string;
}

interface BadgeMapping {
  readonly dependencyName: string;
  readonly pattern: RegExp;
  readonly replacement: (version: string) => string;
}

interface SyncResult {
  readonly badgesUpdated: number;
  readonly footerUpdated: boolean;
  readonly hasChanges: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const ROOT_DIR = join(import.meta.dirname, "../..");
const PACKAGE_JSON_PATH = join(ROOT_DIR, "package.json");
const README_PATH = join(ROOT_DIR, "README.md");
const TIMEZONE = DISPLAY_TIMEZONE;
const FOOTER_PATTERN = /<sub>\*\*Last refresh\*\*: .+<\/sub>/;

// ─────────────────────────────────────────────────────────────────────────────
// Badge Definitions
// ─────────────────────────────────────────────────────────────────────────────

const createBadgeMappings = (pkg: PackageJson): readonly BadgeMapping[] => {
  const bunVersion =
    pkg.packageManager?.replace("bun@", "") ??
    pkg.engines?.["bun"]?.replaceAll(/^>=?/g, "") ??
    "latest";

  return [
    // Core Technologies
    {
      dependencyName: "typescript",
      pattern: /TypeScript-v?[\d.]+(?:-[\w]+)?-3178C6/g,
      replacement: (v) => `TypeScript-v${v}-3178C6`,
    },
    {
      dependencyName: "bun",
      pattern: /Bun-v?[\d.]+(?:-[\w]+)?-000000/g,
      replacement: () => `Bun-v${bunVersion}-000000`,
    },
    {
      dependencyName: "bun",
      pattern: /Bun%20Test-v?[\d.]+(?:-[\w]+)?-000000/g,
      replacement: () => `Bun%20Test-v${bunVersion}-000000`,
    },
    {
      dependencyName: "zod",
      pattern: /Zod-v?[\d.]+(?:-[\w]+)?-3E67B1/g,
      replacement: (v) => `Zod-v${v}-3E67B1`,
    },

    // Development & Build Tools
    {
      dependencyName: "@js-temporal/polyfill",
      pattern: /Temporal-v?[\d.]+(?:-[\w]+)?-1F2A44/g,
      replacement: (v) => `Temporal-v${v}-1F2A44`,
    },
    {
      dependencyName: "@biomejs/biome",
      pattern: /Biome-v?[\d.]+(?:-[\w]+)?-60A5FA/g,
      replacement: (v) => `Biome-v${v}-60A5FA`,
    },
    {
      dependencyName: "ultracite",
      pattern: /Ultracite-v?[\d.]+(?:-[\w]+)?-0B7285/g,
      replacement: (v) => `Ultracite-v${v}-0B7285`,
    },

    // Quality & Automation
    {
      dependencyName: "semantic-release",
      pattern: /semantic--release-v?[\d.]+(?:-[\w]+)?-e10079/g,
      replacement: (v) => `semantic--release-v${v}-e10079`,
    },
    {
      dependencyName: "lefthook",
      pattern: /Lefthook-v?[\d.]+(?:-[\w]+)?-FF4088/g,
      replacement: (v) => `Lefthook-v${v}-FF4088`,
    },
  ] satisfies BadgeMapping[];
};

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

const formatDate = (timezone: string): string => {
  const now = Temporal.Now.zonedDateTimeISO(timezone);
  const formatted = now.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const rawOffset = now.offset;
  const sign = rawOffset[0] ?? "+";
  const hrs = Number.parseInt(rawOffset.slice(1, 3), 10);
  const mins = Number.parseInt(rawOffset.slice(4, 6), 10);
  const utcOffset =
    mins === 0
      ? `UTC${sign}${hrs}`
      : `UTC${sign}${hrs}:${String(mins).padStart(2, "0")}`;

  return `${formatted} (${utcOffset})`;
};

// ─────────────────────────────────────────────────────────────────────────────
// Core Functions
// ─────────────────────────────────────────────────────────────────────────────

const PackageJsonSchema = z.object({
  version: z.string(),
  dependencies: z.record(z.string(), z.string()).optional(),
  devDependencies: z.record(z.string(), z.string()).optional(),
  engines: z.record(z.string(), z.string()).optional(),
  packageManager: z.string().optional(),
});

const loadPackageJson = async (): Promise<PackageJson> => {
  const content = await Bun.file(PACKAGE_JSON_PATH).text();
  const data: unknown = JSON.parse(content);
  return PackageJsonSchema.parse(data) as PackageJson;
};

const loadReadme = (): Promise<string> => {
  return Bun.file(README_PATH).text();
};

const saveReadme = async (content: string): Promise<void> => {
  await Bun.write(README_PATH, content);
};

const extractVersion = (pkg: PackageJson, dep: string): string => {
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  const raw = deps[dep] ?? "0.0.0";
  return raw.replaceAll(/^[\^~>=<]+/g, "");
};

const updateBadges = (readme: string, pkg: PackageJson): [string, number] => {
  const mappings = createBadgeMappings(pkg);
  let updated = readme;
  let count = 0;

  for (const mapping of mappings) {
    const version = extractVersion(pkg, mapping.dependencyName);
    const newBadge = mapping.replacement(version);
    const before = updated;
    updated = updated.replaceAll(mapping.pattern, newBadge);
    if (updated !== before) {
      count++;
    }
  }

  return [updated, count];
};

const updateFooter = (readme: string): [string, boolean] => {
  const newFooter = `<sub>**Last refresh**: ${formatDate(TIMEZONE)}</sub>`;

  if (FOOTER_PATTERN.test(readme)) {
    return [readme.replace(FOOTER_PATTERN, newFooter), true];
  }

  return [readme, false];
};

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

const sync = async (): Promise<SyncResult> => {
  log("Loading package.json...", "info");
  const pkg = await loadPackageJson();

  log("Loading README.md...", "info");
  const originalReadme = await loadReadme();

  log("Updating version badges...", "info");
  const [withBadges, badgesUpdated] = updateBadges(originalReadme, pkg);

  log("Updating footer timestamp...", "info");
  const [finalReadme, footerUpdated] = updateFooter(withBadges);

  const hasChanges = originalReadme !== finalReadme;

  if (hasChanges) {
    log("Saving changes to README.md...", "info");
    await saveReadme(finalReadme);
    log(`Updated ${badgesUpdated} badges`, "success");
    if (footerUpdated) {
      log("Updated footer timestamp", "success");
    }
  } else {
    log("No changes detected", "info");
  }

  return { badgesUpdated, footerUpdated, hasChanges };
};

// ─────────────────────────────────────────────────────────────────────────────
// Entry Point
// ─────────────────────────────────────────────────────────────────────────────

const main = async (): Promise<void> => {
  const result = await sync();

  if (result.hasChanges) {
    log("README sync completed successfully", "success");
  } else {
    log("README is already up to date", "info");
  }
};

main().catch((error: unknown) => {
  log(error instanceof Error ? error.message : String(error), "error");
  process.exit(1);
});
