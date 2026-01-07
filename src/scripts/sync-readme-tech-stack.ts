/**
 * Sync README Tech Stack Badges
 *
 * Updates version badges in README.md based on package.json dependencies
 * and refreshes the footer timestamp.
 *
 * @module sync-readme-tech-stack
 */

import { join } from "node:path";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface PackageJson {
  readonly version: string;
  readonly dependencies?: Readonly<Record<string, string>>;
  readonly devDependencies?: Readonly<Record<string, string>>;
  readonly packageManager?: string;
  readonly engines?: Readonly<Record<string, string>>;
}

interface BadgeMapping {
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
const TIMEZONE = "Asia/Dhaka";
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
      pattern: /TypeScript-[\d.]+(?:-[\w]+)?-3178C6/g,
      replacement: (v) => `TypeScript-${v}-3178C6`,
    },
    {
      pattern: /Bun-[\d.]+(?:-[\w]+)?-000000/g,
      replacement: () => `Bun-${bunVersion}-000000`,
    },
    {
      pattern: /Bun%20Test-[\d.]+(?:-[\w]+)?-000000/g,
      replacement: () => `Bun%20Test-${bunVersion}-000000`,
    },
    {
      pattern: /Zod-[\d.]+(?:-[\w]+)?-3E67B1/g,
      replacement: (v) => `Zod-${v}-3E67B1`,
    },

    // Development & Build Tools
    {
      pattern: /Temporal-[\d.]+(?:-[\w]+)?-1F2A44/g,
      replacement: (v) => `Temporal-${v}-1F2A44`,
    },
    {
      pattern: /Biome-[\d.]+(?:-[\w]+)?-60A5FA/g,
      replacement: (v) => `Biome-${v}-60A5FA`,
    },

    // Quality & Automation
    {
      pattern: /semantic--release-[\d.]+(?:-[\w]+)?-e10079/g,
      replacement: (v) => `semantic--release-${v}-e10079`,
    },
    {
      pattern: /Lefthook-[\d.]+(?:-[\w]+)?-FF4088/g,
      replacement: (v) => `Lefthook-${v}-FF4088`,
    },
  ] satisfies BadgeMapping[];
};

const DEPENDENCY_MAP: Readonly<Record<number, string>> = {
  0: "typescript",
  1: "bun",
  2: "bun",
  3: "zod",
  4: "@js-temporal/polyfill",
  5: "@biomejs/biome",
  6: "semantic-release",
  7: "lefthook",
};

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

const formatDate = (date: Date, timezone: string): string => {
  const formatter = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: timezone,
  });

  const parts = formatter.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((p) => p.type === type)?.value ?? "";

  const weekday = get("weekday");
  const month = get("month");
  const day = get("day");
  const year = get("year");
  const hour = get("hour");
  const minute = get("minute");
  const second = get("second");
  const dayPeriod = get("dayPeriod");

  return `${weekday}, ${month} ${day}, ${year} at ${hour}:${minute}:${second} ${dayPeriod} (UTC+6)`;
};

const log = {
  info: (msg: string) => console.log(`ℹ️  ${msg}`),
  success: (msg: string) => console.log(`✅ ${msg}`),
  warn: (msg: string) => console.log(`⚠️  ${msg}`),
  error: (msg: string) => console.error(`❌ ${msg}`),
};

// ─────────────────────────────────────────────────────────────────────────────
// Core Functions
// ─────────────────────────────────────────────────────────────────────────────

const loadPackageJson = async (): Promise<PackageJson> => {
  const content = await Bun.file(PACKAGE_JSON_PATH).text();
  return JSON.parse(content) as PackageJson;
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

  for (const [index, mapping] of mappings.entries()) {
    const dep = DEPENDENCY_MAP[index];
    if (!dep) {
      continue;
    }

    const version = extractVersion(pkg, dep);
    const newBadge = mapping.replacement(version);

    if (mapping.pattern.test(updated)) {
      updated = updated.replaceAll(mapping.pattern, newBadge);
      count++;
    }
  }

  return [updated, count];
};

const updateFooter = (readme: string): [string, boolean] => {
  const newFooter = `<sub>**Last refresh**: ${formatDate(new Date(), TIMEZONE)}</sub>`;

  if (FOOTER_PATTERN.test(readme)) {
    return [readme.replace(FOOTER_PATTERN, newFooter), true];
  }

  return [readme, false];
};

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

const sync = async (): Promise<SyncResult> => {
  log.info("Loading package.json...");
  const pkg = await loadPackageJson();

  log.info("Loading README.md...");
  const originalReadme = await loadReadme();

  log.info("Updating version badges...");
  const [withBadges, badgesUpdated] = updateBadges(originalReadme, pkg);

  log.info("Updating footer timestamp...");
  const [finalReadme, footerUpdated] = updateFooter(withBadges);

  const hasChanges = originalReadme !== finalReadme;

  if (hasChanges) {
    log.info("Saving changes to README.md...");
    await saveReadme(finalReadme);
    log.success(`Updated ${badgesUpdated} badges`);
    if (footerUpdated) {
      log.success("Updated footer timestamp");
    }
  } else {
    log.info("No changes detected");
  }

  return { badgesUpdated, footerUpdated, hasChanges };
};

// ─────────────────────────────────────────────────────────────────────────────
// Entry Point
// ─────────────────────────────────────────────────────────────────────────────

const main = async (): Promise<void> => {
  const result = await sync();

  if (result.hasChanges) {
    log.success("README sync completed successfully");
  } else {
    log.info("README is already up to date");
  }
};

main().catch((error: unknown) => {
  log.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
