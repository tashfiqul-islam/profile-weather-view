import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

// Configuration

type PackageJson = {
  readonly packageManager?: string;
  readonly dependencies?: Record<string, string>;
  readonly devDependencies?: Record<string, string>;
};

// Precompiled regex for parsing versions and footer date
const VERSION_REGEX: RegExp = /\d+(?:\.\d+){0,2}/;
const BUN_PM_REGEX: RegExp = /bun@([\d.]+)/;
const FOOTER_DATE_REGEX: RegExp = /<sub>\*\*Last refresh\*\*: [^<]+<\/sub>/;

function coerceVersion(versionRange?: string): string | undefined {
  if (versionRange === undefined) {
    return;
  }
  const match: RegExpExecArray | null = VERSION_REGEX.exec(versionRange);
  return match ? match[0] : undefined;
}

function getBunVersion(pkg: PackageJson): string | undefined {
  const pm: string | undefined = pkg.packageManager;
  const fromPm: RegExpMatchArray | null | undefined = pm?.match(BUN_PM_REGEX);
  if (fromPm?.[1]) {
    return fromPm[1];
  }
  const fromTypes: string | undefined = pkg.devDependencies?.["bun-types"];
  return coerceVersion(fromTypes);
}

async function readPackageJson(cwd: string): Promise<PackageJson> {
  const file: string = await readFile(resolve(cwd, "package.json"), "utf8");
  return JSON.parse(file) as PackageJson;
}

async function readReadme(cwd: string): Promise<string> {
  const file: string = await readFile(resolve(cwd, "README.md"), "utf8");
  return file;
}

async function writeReadme(cwd: string, content: string): Promise<void> {
  await writeFile(resolve(cwd, "README.md"), content, "utf8");
}

/**
 * Replace a shields.io badge version segment while preserving color and logo.
 */
function replaceBadge(
  content: string,
  badgeConfig: Readonly<{
    label: string;
    version: string;
    color: string;
    logoSegment: string;
  }>
): string {
  const { label, version, color, logoSegment } = badgeConfig;
  const escapedLabel: string = label.replace(/[-/]/g, (m: string) => `\\${m}`);
  const pattern: RegExp = new RegExp(
    `https://img\\.shields\\.io/badge/${escapedLabel}-[^-?]+-${color}\\?style=flat-square${logoSegment.replace(/\?/g, "\\?")}`,
    "g"
  );
  const replacement: string = `https://img.shields.io/badge/${label}-${version}-${color}?style=flat-square${logoSegment}`;
  return content.replace(pattern, replacement);
}

function updateFooterDate(content: string, isoDate: Date): string {
  const formatted: string = isoDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeFormatted: string = isoDate.toLocaleTimeString("en-US", {
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
  const cwd: string = process.cwd();
  const pkg: PackageJson = await readPackageJson(cwd);
  const originalReadme: string = await readReadme(cwd);
  let updatedReadme: string = originalReadme;

  const deps: Readonly<Record<string, string>> = {
    ...(pkg.dependencies ?? {}),
    ...(pkg.devDependencies ?? {}),
  };

  const segments = [
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
  ] as const;

  type Label = (typeof segments)[number]["label"];

  const versions: Readonly<Record<Label, string | undefined>> = {
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
  } as const;

  for (const seg of segments) {
    const version = versions[seg.label];
    if (version) {
      updatedReadme = replaceBadge(updatedReadme, {
        label: seg.label,
        version,
        color: seg.color,
        logoSegment: seg.logo,
      });
    }
  }

  updatedReadme = updateFooterDate(updatedReadme, new Date());

  if (updatedReadme !== originalReadme) {
    await writeReadme(cwd, updatedReadme);
  }
}

main().catch(() => {
  // Avoid console; set exit code for CI visibility
  process.exitCode = 1;
});
