/**
 * Documentation versioning utilities
 * @module version
 */

import type {
  VersionMetadata,
  VersionRelease,
  VersionNavItem,
} from './theme/types/version';
import meta from '../../../meta.json';

/**
 * Core version constants
 * @readonly
 */
export const VERSION_CONFIG = {
  PREFIX: 'v',
  ROUTES: {
    latest: '/latest/',
    stable: '/stable/',
    next: '/next/',
    beta: '/beta/',
    unreleased: '/unreleased/',
  } as const,
} as const;

/**
 * Current version configuration
 * @readonly
 */
export const VERSION_STATE = {
  // Documentation versions
  LATEST: meta.channels?.docs?.latest ?? meta.docsVersion,
  STABLE: meta.channels?.docs?.stable ?? meta.docsVersion,
  CURRENT: meta.docsVersion,
} as const;

/**
 * Format release date for human-readable display
 * @param isoDateString - ISO 8601 formatted date string
 * @returns Formatted date string
 */
export function formatReleaseDate(isoDateString: string): string {
  if (!isoDateString) return 'Unknown Date';

  try {
    const date = new Date(isoDateString);

    if (isNaN(date.getTime())) return 'Invalid Date';

    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC', // Explicitly set timezone
    }).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Date Format Error';
  }
}

/**
 * All available documentation versions sorted by recency
 * @readonly
 */
export const ALL_VERSIONS = meta.releases
  ? [...meta.releases]
      .filter((release) => release.type === 'docs')
      .sort((a, b) => compareVersions(b.version, a.version))
  : [createDefaultRelease()];

/**
 * Creates a default release object when no releases are defined
 * @returns {VersionRelease} Default release configuration
 */
function createDefaultRelease(): VersionRelease {
  const [major = '0', minor = '0', patch = '0'] = meta.docsVersion.split('.');

  return {
    type: 'docs',
    version: meta.docsVersion,
    date: new Date().toISOString().split('T')[0],
    channel: 'stable',
    docs: `/v${major}.${minor}/`,
    major,
    minor,
    patch,
  };
}

/**
 * Compare two semantic versions
 * @param version1 - First version
 * @param version2 - Second version
 * @returns Comparison result (-1, 0, 1)
 */
export function compareVersions(version1: string, version2: string): number {
  const normalize = (v: string): number[] =>
    v.split('.').map(Number).concat([0, 0]).slice(0, 3);

  const [maj1, min1, pat1] = normalize(version1);
  const [maj2, min2, pat2] = normalize(version2);

  return maj1 !== maj2
    ? maj1 - maj2
    : min1 !== min2
      ? min1 - min2
      : pat1 - pat2;
}

/**
 * Format version string with optional prefix
 * @param version - Version to format
 * @param options - Formatting options
 */
export function formatVersion(
  version: string,
  options: { prefix?: boolean; label?: boolean } = {},
): string {
  const { prefix = true, label = false } = options;

  if (!version) return '';

  const specialVersions = {
    unreleased: 'Unreleased',
    next: 'Next',
    beta: 'Beta',
  };

  if (version in specialVersions) {
    return specialVersions[version as keyof typeof specialVersions];
  }

  let formatted = prefix ? `${VERSION_CONFIG.PREFIX}${version}` : version;

  if (label) {
    formatted += getVersionLabel(version);
  }

  return formatted;
}

/**
 * Get version label based on status
 * @param version - Version to get label for
 */
export function getVersionLabel(version: string): string {
  if (version === VERSION_STATE.LATEST) {
    return ' (Latest)';
  }
  if (
    version === VERSION_STATE.STABLE &&
    VERSION_STATE.STABLE !== VERSION_STATE.LATEST
  ) {
    return ' (Stable)';
  }
  return '';
}

/**
 * Extract version from path with enhanced validation
 * @param path - URL path
 * @returns Extracted version or null
 */
export function extractVersionFromPath(path: string): string | null {
  if (!path) return null;

  // Check special routes
  const specialRoute = Object.entries(VERSION_CONFIG.ROUTES).find(
    ([_, route]) => path === route || path.startsWith(route),
  );

  if (specialRoute) {
    const [key] = specialRoute;
    return VERSION_STATE.LATEST ?? null;
  }

  // Check versioned paths
  const versionMatch = path.match(
    new RegExp(`^\\/${VERSION_CONFIG.PREFIX}(\\d+\\.\\d+)(?:\\/|$)`),
  );

  if (versionMatch?.[1]) {
    const prefix = versionMatch[1];
    const versions = ALL_VERSIONS.filter((release) =>
      release.version.startsWith(prefix),
    ).sort((a, b) => compareVersions(b.version, a.version));

    return versions[0]?.version ?? null;
  }

  return null;
}

/**
 * Check if path is versioned
 * @param path - Path to check
 */
export function isVersionedPath(path: string): boolean {
  if (!path) return false;

  const versionPrefixes = [
    ...Object.values(VERSION_CONFIG.ROUTES),
    ...ALL_VERSIONS.map(
      (v) =>
        `/${VERSION_CONFIG.PREFIX}${v.version.split('.').slice(0, 2).join('.')}/`,
    ),
  ];

  return versionPrefixes.some(
    (prefix) => path === prefix || path.startsWith(prefix),
  );
}

/**
 * Get version prefixes for path matching
 * @returns Array of version prefixes
 */
export function getVersionPrefixes(): string[] {
  return ALL_VERSIONS.map((version) =>
    version.version.split('.').slice(0, 2).join('.'),
  );
}

/**
 * Get version path with proper routing
 * @param version - Target version
 * @param path - Current path
 */
export function getVersionPath(version: string, path = '/'): string {
  if (!version) return path;

  const cleanPath = stripVersionFromPath(path);
  const normalizedPath = cleanPath === '/' ? '' : cleanPath.replace(/^\//, '');

  // Handle special routes
  if (version === VERSION_STATE.LATEST) {
    return `${VERSION_CONFIG.ROUTES.latest}${normalizedPath}`;
  }

  // Generate versioned path
  const versionPrefix = version.split('.').slice(0, 2).join('.');
  return `/${VERSION_CONFIG.PREFIX}${versionPrefix}/${normalizedPath}`;
}

/**
 * Strip version prefix from path
 * @param path - Path to process
 */
export function stripVersionFromPath(path: string): string {
  if (!path) return '/';

  let result = path;

  // Remove special routes
  for (const route of Object.values(VERSION_CONFIG.ROUTES)) {
    if (result === route) return '/';
    if (result.startsWith(route)) {
      result = result.substring(route.length);
      break;
    }
  }

  // Remove version prefix
  result = result.replace(
    new RegExp(`^\\/${VERSION_CONFIG.PREFIX}\\d+\\.\\d+\\/?`),
    '',
  );

  // Normalize path
  result = '/' + result.replace(/^\/+|\/+$/g, '');
  return result || '/';
}

/**
 * Get alternate version paths
 * @param currentPath - Current path
 */
export function getAlternateVersionPaths(
  currentPath: string,
): Record<string, string> {
  const currentVersion =
    extractVersionFromPath(currentPath) ?? VERSION_STATE.LATEST;
  const cleanPath = stripVersionFromPath(currentPath);

  return ALL_VERSIONS.reduce(
    (paths, release) => {
      if (release.version !== currentVersion) {
        paths[release.version] = getVersionPath(release.version, cleanPath);
      }
      return paths;
    },
    {} as Record<string, string>,
  );
}

/**
 * Get version navigation data
 * @returns Navigation items for UI
 */
export function getVersionsNavData(): VersionNavItem[] {
  return ALL_VERSIONS.map((release) => ({
    version: release.version,
    label: formatVersion(release.version, { label: true }),
    path: release.docs ?? getVersionPath(release.version),
    isLatest: release.version === VERSION_STATE.LATEST,
    isStable:
      release.version === VERSION_STATE.STABLE &&
      VERSION_STATE.STABLE !== VERSION_STATE.LATEST,
    date: formatReleaseDate(release.date),
  }));
}

/**
 * Get canonical path for SEO
 * @param path - Current path
 */
export function getCanonicalPath(path: string): string {
  const cleanPath = stripVersionFromPath(path);
  return `https://profile-weather-view.dev${cleanPath}`;
}

// Export types
export type { VersionMetadata, VersionRelease, VersionNavItem };
