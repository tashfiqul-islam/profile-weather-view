/**
 * Virtual Versioning Plugin for VitePress
 *
 * Zero-configuration documentation versioning solution
 */

import type { Plugin, UserConfig } from 'vitepress';
import {
  VERSION_CONFIG,
  VERSION_STATE,
  ALL_VERSIONS,
  extractVersionFromPath,
  stripVersionFromPath,
  isVersionedPath,
  getCanonicalPath,
} from '../version';

/**
 * Virtual versioning plugin configuration options
 */
export interface VirtualVersionOptions {
  /** Enable verbose debugging */
  debug?: boolean;
  /** Content directories to apply versioning */
  contentDirs?: string[];
  /** Add trailing slashes to paths */
  trailingSlash?: boolean;
  /** Custom SEO configuration */
  seo?: {
    /** Base domain for canonical URLs */
    domain?: string;
  };
}

/**
 * Create a virtual versioning plugin for VitePress
 *
 * @param options - Plugin configuration
 * @returns Fully configured VitePress plugin
 */
export function virtualVersionsPlugin(
  options: VirtualVersionOptions = {},
): Plugin {
  // Default configuration
  const config: Required<VirtualVersionOptions> = {
    debug: process.env.NODE_ENV === 'development',
    contentDirs: ['guide', 'reference', 'examples', 'api'],
    trailingSlash: false,
    seo: {
      domain: 'https://profile-weather-view.dev',
    },
  };

  // Merge user options
  Object.assign(config, options);

  // Debug logging utility
  const logDebug = (message: string, ...args: any[]) => {
    if (config.debug) {
      console.log(`[VirtualVersions] ${message}`, ...args);
    }
  };

  // Initialize debug logging
  if (config.debug) {
    console.log('🔄 Virtual Versioning Plugin Initialized', {
      environment: process.env.NODE_ENV,
      latestVersion: VERSION_STATE.LATEST,
      availableVersions: ALL_VERSIONS.length,
    });
  }

  return {
    name: 'vitepress-virtual-versions',

    /**
     * Configure development server middleware
     */
    configureServer(server) {
      return () => {
        server.middlewares.use((req, res, next) => {
          if (!req.url) return next();

          // Path transformation logic
          const originalUrl = req.url;
          const transformedPath = isVersionedPath(req.url)
            ? stripVersionFromPath(req.url)
            : req.url;

          // Update URL with transformed path
          req.url = transformedPath;

          // Trailing slash management
          if (
            config.trailingSlash &&
            !req.url.endsWith('/') &&
            !req.url.includes('.')
          ) {
            req.url = `${req.url}/`;
          } else if (
            !config.trailingSlash &&
            req.url.endsWith('/') &&
            req.url !== '/'
          ) {
            req.url = req.url.slice(0, -1);
          }

          // Extract and log version information
          const currentVersion = extractVersionFromPath(originalUrl);
          logDebug(`DevServer Rewrite: ${originalUrl} → ${req.url}`, {
            extractedVersion: currentVersion,
          });

          next();
        });
      };
    },

    /**
     * Enhance configuration with version rewrites
     */
    config(siteConfig: UserConfig): UserConfig {
      const rewrites: Record<string, string> = {};

      // Generate rewrites for content directories
      config.contentDirs.forEach((dir) => {
        // Special route handling
        Object.values(VERSION_CONFIG.ROUTES).forEach((route) => {
          rewrites[`${route}${dir}/:page*`] = `${dir}/:page*`;
        });

        // Version-specific rewrites
        rewrites[`v:major.:minor/${dir}/:page*`] = `${dir}/:page*`;
      });

      // Root path handling
      Object.values(VERSION_CONFIG.ROUTES).forEach((route) => {
        rewrites[`${route}`] = '/';
        rewrites[`${route}index`] = '/';
      });

      // Version root rewrites
      rewrites['v:major.:minor/'] = '/';
      rewrites['v:major.:minor/index'] = '/';

      logDebug('Generated Rewrites:', rewrites);

      // Generate canonical URL for each possible version path
      const versionPaths = ALL_VERSIONS.map((version) =>
        getCanonicalPath(`/v${version.version}`),
      );

      // Merge rewrites with existing configuration
      return {
        ...siteConfig,
        rewrites: {
          ...siteConfig.rewrites,
          ...rewrites,
        },
        // Add SEO configuration for canonical URLs
        titleTemplate: '%s | Your Documentation',
        description: 'Versioned Documentation Platform',
        head: [
          ...(siteConfig.head || []),
          // Primary canonical URL
          ['link', { rel: 'canonical', href: config.seo.domain || '' }, ''],
          // Add alternate version links
          ...versionPaths
            .filter((path) => path) // Ensure path is not undefined
            .map(
              (path) =>
                ['link', { rel: 'alternate', href: path }, ''] as [
                  string,
                  Record<string, string>,
                  string,
                ],
            ),
        ],
      };
    },

    /**
     * Build completion hook
     */
    buildEnd(error?: Error) {
      if (error) {
        console.error('Build failed:', error);
        return;
      }

      if (config.debug) {
        console.log('🏗️ Virtual Versioning Build Complete', {
          latestVersion: VERSION_STATE.LATEST,
          totalVersions: ALL_VERSIONS.length,
          contentDirs: config.contentDirs,
          canonicalBase: config.seo.domain,
        });
      }
    },
  };
}

export default virtualVersionsPlugin;
