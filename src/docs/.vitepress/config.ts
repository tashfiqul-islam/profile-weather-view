/**
 * config.ts
 * Main entry point for VitePress configuration
 * Imports and composes modular configuration components
 */

import { defineConfig } from 'vitepress';
import type { DefaultTheme } from 'vitepress';

// Import all configuration modules
import { head } from './config/meta';
import { nav, sidebar, editLink, docFooter } from './config/nav';
import { createThemeConfig } from './config/theme';
import { socialLinks } from './config/social';
import { footer } from './config/footer';
import { markdown } from './config/markdown';
import { search } from './config/search';
import { sitemap } from './config/seo';
import { locales } from './config/i18n';

/**
 * The Main VitePress configuration
 * Brings together all modular components
 */
export default defineConfig({
  // Site-wide configurations
  title: 'Profile Weather View',
  description: 'Automated weather updates for your GitHub profile README',
  lang: 'en-US',
  lastUpdated: true,
  cleanUrls: true,
  ignoreDeadLinks: true,

  // Meta-tags and SEO configuration from meta.ts
  head,

  // Theme configuration - combines all UI-related settings
  themeConfig: {
    // Base theme configuration from theme.ts
    ...createThemeConfig(),

    // Navigation configuration from nav.ts
    nav,
    sidebar,
    editLink,
    docFooter,

    // Social links configuration from social.ts
    socialLinks,

    // Footer configuration from footer.ts
    footer,

    // Search configuration from search.ts
    search,
  } as DefaultTheme.Config,

  // Markdown configuration from markdown.ts
  markdown,

  // Internationalization from i18n.ts
  locales,

  // Sitemap configuration from seo.ts
  sitemap,

  // Build optimization hooks
  buildEnd: async (siteConfig): Promise<void> => {
    // Can add custom build logic here
    console.log('VitePress site build complete!');
  },

  // Vue options for advanced customization
  vue: {
    template: {
      compilerOptions: {
        isCustomElement: (tag: string): boolean => tag === 'custom-element',
      },
    },
  },
});
