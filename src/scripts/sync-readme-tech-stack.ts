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

  const offsetParts = new Intl.DateTimeFormat("en", {
    timeZone: timezone,
    timeZoneName: "shortOffset",
  }).formatToParts(date);
  const rawOffset =
    offsetParts.find((p) => p.type === "timeZoneName")?.value ?? "GMT+0";
  const utcOffset = rawOffset.replace("GMT", "UTC");

  return `${weekday}, ${month} ${day}, ${year} at ${hour}:${minute}:${second} ${dayPeriod} (${utcOffset})`;
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
