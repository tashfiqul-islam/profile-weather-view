/**
 * Version-related type definitions
 * @module types/version
 */

/**
 * Version release information
 */
export interface VersionRelease {
  type: string;
  /** Semantic version number */
  version: string;
  /** Release date in ISO format */
  date: string;
  /** Major version number */
  major: string;
  /** Minor version number */
  minor: string;
  /** Patch version number */
  patch?: string;
  /** Release channel */
  channel: 'stable' | 'next' | 'beta' | 'unreleased';
  /** Documentation path */
  docs: string;
}

/**
 * Version metadata configuration
 */
export interface VersionMetadata {
  /** Current version */
  version: string;
  /** Available releases */
  releases: VersionRelease[];
  /** Channel configuration */
  channels: {
    /** Latest version */
    latest: string;
    /** Stable version */
    stable: string;
    /** Next version (optional) */
    next?: string;
    /** Beta version (optional) */
    beta?: string;
  };
}

/**
 * Version navigation item for UI
 */
export interface VersionNavItem {
  /** Version number */
  version: string;
  /** Display label */
  label: string;
  /** Navigation path */
  path: string;
  /** Whether this is the latest version */
  isLatest: boolean;
  /** Whether this is the stable version */
  isStable: boolean;
  /** Release date */
  date: string;
}
