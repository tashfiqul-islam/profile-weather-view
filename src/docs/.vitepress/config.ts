/**
 * VitePress Configuration
 *
 * Comprehensive configuration for documentation site with version support,
 * SEO optimization, and performance enhancements.
 */

import { resolve } from 'node:path';
import { defineConfig } from 'vitepress';
import type { DefaultTheme, HeadConfig } from 'vitepress';

// Import Tailwind CSS v4 Vite plugin
import tailwindcss from '@tailwindcss/vite';

// Import configuration modules
import { createFooter } from './config/footer';
import { locales } from './config/i18n';
import { markdown } from './config/markdown';
import { docFooter, editLink, nav, sidebar } from './config/nav';
import { search } from './config/search';
import { createHeadTags } from './config/seo';
import { head } from './config/meta';
import socialLinks from './config/social';

// Import virtual versioning plugin
import { virtualVersionsPlugin } from './plugins/virutalVersions';

// Import versioning utilities
import {
  VERSION_STATE,
  ALL_VERSIONS,
  VERSION_CONFIG,
  formatVersion,
  getVersionPath,
  stripVersionFromPath,
  extractVersionFromPath,
} from './version';

// Path resolution based on project structure
const ROOT_DIR = resolve(process.cwd());
const SRC_DIR = resolve(ROOT_DIR, 'src');
const DOCS_DIR = resolve(SRC_DIR, 'docs');

// Content directories that need versioning
const CONTENT_DIRS = ['guide', 'reference', 'examples', 'api'];

// Font preloading configuration
const FONT_PRELOADS: HeadConfig[] = [
  // Ropa Sans
  [
    'link',
    {
      as: 'font',
      crossorigin: '',
      href: '/fonts/RopaSans/RopaSans-Regular.woff',
      rel: 'preload',
      type: 'font/woff',
    },
  ],
  [
    'link',
    {
      as: 'font',
      crossorigin: '',
      href: '/fonts/RopaSans/RopaSans-Italic.woff',
      rel: 'preload',
      type: 'font/woff',
    },
  ],

  // Fira Code
  [
    'link',
    {
      as: 'font',
      crossorigin: '',
      href: '/fonts/FiraCode/FiraCode-VF.woff',
      rel: 'preload',
      type: 'font/woff',
    },
  ],
  [
    'link',
    {
      as: 'font',
      crossorigin: '',
      href: '/fonts/FiraCode/FiraCode-Regular.woff',
      rel: 'preload',
      type: 'font/woff',
    },
  ],
];

/**
 * Generates URL redirects for version compatibility
 * Makes it easy to access versioned documentation with predictable URLs
 */
const generateVersionRedirects = () => {
  const redirects: Record<string, string> = {};

  // Add special route redirects
  redirects['/latest'] = VERSION_CONFIG.ROUTES.latest;
  redirects['/stable'] = VERSION_CONFIG.ROUTES.stable;
  redirects['/next'] = VERSION_CONFIG.ROUTES.next;

  // Add redirects for all available versions
  ALL_VERSIONS.forEach((version) => {
    const versionPrefix = version.version.split('.').slice(0, 2).join('.');
    const path = getVersionPath(version.version);
    redirects[`/v${versionPrefix}`] = path;
  });

  return redirects;
};

/**
 * Generates rewrites for virtual versioning
 * Maps versioned paths to actual content
 */
const generateVersionRewrites = () => {
  const rewrites: Record<string, string> = {};

  // Generate rewrites for all content directories
  for (const dir of CONTENT_DIRS) {
    // Special route rewrites
    Object.keys(VERSION_CONFIG.ROUTES).forEach((key) => {
      rewrites[`${key}/${dir}/:page*`] = `${dir}/:page*`;
    });

    // Version-specific rewrites
    rewrites[`v:major.:minor/${dir}/:page*`] = `${dir}/:page*`;
  }

  // Root path rewrites
  Object.keys(VERSION_CONFIG.ROUTES).forEach((key) => {
    rewrites[`${key}/`] = '/';
    rewrites[`${key}/index`] = '/';
  });

  // Version-specific root rewrites
  rewrites[`v:major.:minor/`] = '/';
  rewrites[`v:major.:minor/index`] = '/';

  return rewrites;
};

/**
 * Creates custom head tags with version information
 * Improves SEO by communicating available versions to search engines
 */
const generateVersionedHeadTags = (): HeadConfig[] => {
  const versionTags: HeadConfig[] = [];

  // Add version meta tag
  versionTags.push([
    'meta',
    { name: 'version', content: VERSION_STATE.LATEST },
  ]);

  // Add alternate version links for SEO
  ALL_VERSIONS.forEach((version) => {
    const versionPath = getVersionPath(version.version);
    versionTags.push([
      'link',
      {
        rel: 'alternate',
        hreflang: 'x-default',
        href: `https://profile-weather-view.dev${versionPath}`,
        title: `${formatVersion(version.version)}${version.version === VERSION_STATE.LATEST ? ' (Latest)' : ''}`,
      },
    ]);
  });

  return versionTags;
};

export default defineConfig({
  // Base site configuration
  title: 'Profile Weather View',
  description: 'Automated weather updates for your GitHub profile README',
  lang: 'en-US',
  lastUpdated: true,
  base: '/',

  // Internationalization
  locales,

  // Head metadata with versioning
  head: [
    ...head,
    ...FONT_PRELOADS,
    ...createHeadTags(),
    ...generateVersionedHeadTags(),
  ],

  // Markdown processing
  markdown,

  // SEO configuration
  sitemap: {
    hostname: 'https://profile-weather-view.dev',
    transformItems: (items) => {
      return items.map((item) => {
        const version = extractVersionFromPath(item.url);
        if (version) {
          // Add version information to the sitemap
          return {
            ...item,
            // Lower priority for non-latest versions
            priority:
              version === VERSION_STATE.LATEST
                ? item.priority
                : Math.max(0.1, (item.priority || 0.5) - 0.2),
            // Add change frequency based on version
            changefreq: version === VERSION_STATE.LATEST ? 'weekly' : 'monthly',
          };
        }
        return item;
      });
    },
  },

  // URL rewrites for virtual versioning
  // Map version-prefixed paths to actual content
  rewrites: generateVersionRewrites(),

  // URL redirects for version compatibility
  redirects: generateVersionRedirects(),

  // Theme configuration
  themeConfig: {
    // Navigation
    nav: nav as DefaultTheme.NavItem[],
    sidebar,
    editLink,
    docFooter,
    footer: createFooter(),
    search,
    socialLinks,

    // Logo configuration
    logo: {
      light: '/icons/weather-hero-2.svg',
      dark: '/icons/weather-hero-2.svg',
      alt: 'Profile Weather View',
    },

    // Theme appearance settings
    darkModeSwitchLabel: 'Theme',

    // Content outline
    outline: {
      level: [2, 3],
      label: 'On this page',
    },

    // Last updated timestamp
    lastUpdated: {
      text: 'Last Updated',
      formatOptions: {
        dateStyle: 'medium',
        timeStyle: 'short',
      },
    },

    // External link icons
    externalLinkIcon: true,

    // Accessibility labels
    langMenuLabel: 'Change language',
    returnToTopLabel: 'Back to top',
    sidebarMenuLabel: 'Menu',

    // Version information
    // @ts-expect-error - Custom versions property for our theme
    versions: {
      current: VERSION_STATE.LATEST,
      stable: VERSION_STATE.STABLE,
      releases: ALL_VERSIONS.map((version) => ({
        text: formatVersion(version.version),
        date: version.date,
        link: getVersionPath(version.version),
        isLatest: version.version === VERSION_STATE.LATEST,
        isStable:
          version.version === VERSION_STATE.STABLE &&
          VERSION_STATE.STABLE !== VERSION_STATE.LATEST,
      })),
    },
  },

  // Vite build configuration
  vite: {
    // Path aliases matching project structure
    resolve: {
      alias: {
        '@': SRC_DIR,
        '@/config': resolve(SRC_DIR, 'config'),
        '@/docs': DOCS_DIR,
        '@/tests': resolve(SRC_DIR, '__tests__'),
        '@/types': resolve(SRC_DIR, 'types'),
        '@/weather-update': resolve(SRC_DIR, 'weather-update'),
      },
    },

    // Plugins configuration
    plugins: [
      // Add Tailwind CSS
      tailwindcss(),

      // Add virtual versioning plugin
      virtualVersionsPlugin({
        debug: process.env.NODE_ENV === 'development',
        contentDirs: CONTENT_DIRS,
        trailingSlash: false,
      }),
    ],

    // Development server configuration
    server: {
      cors: true,
      fs: {
        allow: ['..'],
        strict: false,
      },
      host: true,
    },

    // Build optimization
    build: {
      chunkSizeWarningLimit: 1024,
      cssMinify: 'lightningcss',
      minify: 'esbuild',
      reportCompressedSize: false,
      sourcemap: process.env.NODE_ENV !== 'production',
      target: 'esnext',

      // Output configuration
      rollupOptions: {
        output: {
          // Split code into logical chunks
          manualChunks: {
            theme: [resolve(__dirname, 'theme/index.ts')],
            vue: ['vue', 'vue-router'],
            versions: [resolve(__dirname, 'version.ts')],
          },

          // Consistent naming for better caching
          assetFileNames: (assetInfo) => {
            const name = assetInfo.name || '';
            // Font files
            if (/\.(woff2?|ttf|otf)$/.test(name)) {
              return 'assets/fonts/[name].[hash].[ext]';
            }
            // Image files
            if (/\.(png|jpe?g|gif|svg|webp|avif)$/.test(name)) {
              return 'assets/images/[name].[hash].[ext]';
            }
            // CSS files
            if (/\.css$/.test(name)) {
              return 'assets/styles/[name].[hash].[ext]';
            }
            // Default for other assets
            return 'assets/[name].[hash].[ext]';
          },
          chunkFileNames: 'assets/chunks/[name].[hash].js',
          entryFileNames: 'assets/entries/[name].[hash].js',
        },
      },
    },

    // CSS processing
    css: {
      // Use Lightning CSS for better performance
      lightningcss: {
        drafts: {
          customMedia: true,
        },
      },
      transformer: 'lightningcss',
    },

    // Optimize dependencies
    optimizeDeps: {
      exclude: ['vitepress'],
      include: ['vue'],
    },

    // Faster esbuild configuration
    esbuild: {
      legalComments: 'none',
      platform: 'browser',
      target: 'esnext',
    },
  },

  // Modern features
  cleanUrls: true,
  metaChunk: true,

  // Add reading time and version info to pages
  transformPageData(pageData) {
    // Use the markdown content or fallback to frontmatter description
    let text = '';

    if (pageData.frontmatter.description) {
      text += pageData.frontmatter.description;
    }

    // Access the raw markdown sections if available
    if (pageData.headers) {
      text += pageData.headers.map((header) => `${header.title}`).join(' ');
    }

    // Count words and calculate reading time
    const words = text.split(/\s+/g).filter(Boolean).length || 0;
    const readingTime = Math.max(1, Math.round(words / 250));

    // Add to frontmatter
    pageData.frontmatter.readingTime = readingTime;

    // Extract version information
    const version = extractVersionFromPath(pageData.relativePath);
    if (version) {
      pageData.frontmatter.version = version;
      pageData.frontmatter.isLatest = version === VERSION_STATE.LATEST;
      pageData.frontmatter.isStable = version === VERSION_STATE.STABLE;

      // Add canonical URL for SEO
      pageData.frontmatter.head = pageData.frontmatter.head || [];
      const canonicalPath = stripVersionFromPath(`/${pageData.relativePath}`);
      pageData.frontmatter.head.push([
        'link',
        { rel: 'canonical', href: canonicalPath },
      ]);
    }
  },

  // File exclusions
  srcExclude: [
    '**/README.md',
    '**/CHANGELOG.md',
    '**/*.test.{js,ts}',
    '**/*.spec.{js,ts}',
    '**/*.d.ts',
    '**/node_modules/**',
  ],

  // Cache directory
  cacheDir: './.vitepress/cache',
});
