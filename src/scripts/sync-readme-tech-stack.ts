import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

// ================================
// 📊 Configuration Constants
// ================================

type PackageJson = {
  packageManager?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

// Lift regex to top-level per performance rule
const VERSION_REGEX = /\d+(?:\.\d+){0,2}/;
const BUN_PM_REGEX = /bun@([\d.]+)/;
const FOOTER_DATE_REGEX = /<sub>\*\*Last refresh\*\*: [^<]+<\/sub>/;

function coerceVersion(versionRange: string | undefined): string | undefined {
  if (!versionRange) {
    return;
  }
  const match = VERSION_REGEX.exec(versionRange);
  return match ? match[0] : undefined;
}

function getBunVersion(pkg: PackageJson): string | undefined {
  const pm = pkg.packageManager;
  const fromPm = pm && BUN_PM_REGEX.exec(pm);
  if (fromPm?.[1]) {
    return fromPm[1];
  }
  const fromTypes = pkg.devDependencies?.["bun-types"];
  return coerceVersion(fromTypes);
}

async function readPackageJson(cwd: string): Promise<PackageJson> {
  const file = await readFile(resolve(cwd, "package.json"), "utf8");
  return JSON.parse(file) as PackageJson;
}

async function readReadme(cwd: string): Promise<string> {
  const file = await readFile(resolve(cwd, "README.md"), "utf8");
  return file;
}

async function writeReadme(cwd: string, content: string): Promise<void> {
  await writeFile(resolve(cwd, "README.md"), content, "utf8");
}

function replaceBadge(
  content: string,
  badgeConfig: {
    label: string;
    version: string;
    color: string;
    logoSegment: string;
  }
): string {
  // Pattern: https://img.shields.io/badge/Label-<version>-<color>?style=flat-square<logoSegment>
  const { label, version, color, logoSegment } = badgeConfig;
  const escapedLabel = label.replace(/[-/]/g, (m) => `\\${m}`);
  const pattern = new RegExp(
    `https://img\\.shields\\.io/badge/${escapedLabel}-[^-?]+-${color}\\?style=flat-square${logoSegment.replace(/\?/g, "\\?")}`,
    "g"
  );
  const replacement = `https://img.shields.io/badge/${label}-${version}-${color}?style=flat-square${logoSegment}`;
  return content.replace(pattern, replacement);
}

function updateFooterDate(content: string, isoDate: Date): string {
  const formatted = isoDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeFormatted = isoDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Asia/Dhaka",
  });
  return content.replace(
    FOOTER_DATE_REGEX,
    `<sub>**Last refresh**: ${formatted} at ${timeFormatted} (UTC+6)</sub>`
  );
}

async function main(): Promise<void> {
  const cwd = process.cwd();
  const pkg = await readPackageJson(cwd);
  let readme = await readReadme(cwd);

  const deps = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };

  const versions: Record<string, string | undefined> = {
    TypeScript: coerceVersion(deps["typescript"]),
    Bun: getBunVersion(pkg),
    Vitest: coerceVersion(deps["vitest"]),
    Zod: coerceVersion(deps["zod"]),
    Axios: coerceVersion(deps["axios"]),
    Temporal: coerceVersion(deps["@js-temporal/polyfill"]),
    Vite: coerceVersion(deps["vite"]),
    Biome: coerceVersion(deps["@biomejs/biome"]),
    Ultracite: coerceVersion(deps["ultracite"]),
    "semantic--release": coerceVersion(deps["semantic-release"]),
  };

  // Badge color + logo segments must match README patterns exactly
  const segments: Array<{ label: string; color: string; logo: string }> = [
    {
      label: "TypeScript",
      color: "3178C6",
      logo: "&logo=typescript&logoColor=white",
    },
    { label: "Bun", color: "000000", logo: "&logo=bun&logoColor=white" },
    { label: "Vitest", color: "6E9F18", logo: "&logo=vitest&logoColor=white" },
    { label: "Zod", color: "3E67B1", logo: "" },
    { label: "Axios", color: "5A29E4", logo: "&logo=axios&logoColor=white" },
    { label: "Temporal", color: "1F2A44", logo: "" },
    { label: "Vite", color: "646CFF", logo: "&logo=vite&logoColor=white" },
    { label: "Biome", color: "60A5FA", logo: "&logo=biome&logoColor=white" },
    { label: "Ultracite", color: "0B7285", logo: "" },
    {
      label: "semantic--release",
      color: "e10079",
      logo: "&logo=semantic-release",
    },
  ];

  for (const seg of segments) {
    const version = versions[seg.label];
    if (version) {
      readme = replaceBadge(readme, {
        label: seg.label,
        version,
        color: seg.color,
        logoSegment: seg.logo,
      });
    }
  }

  // Update footer last refresh date
  readme = updateFooterDate(readme, new Date());

  await writeReadme(cwd, readme);
}

await main();
