/* src/docs/.vitepress/config.ts */

import { defineConfig } from 'vitepress';
import type { DefaultTheme } from 'vitepress';
import tailwindcss from '@tailwindcss/vite';

// Import modular configurations
import { head } from './config/meta';
import { nav, sidebar, editLink, docFooter } from './config/nav';
import { createThemeConfig } from './config/theme';
import { socialLinks } from './config/social';
import { footer, createFooter } from './config/footer';
import { markdown } from './config/markdown';
import { search } from './config/search';
import { sitemap } from './config/seo';
import { createLocales } from './config/i18n';

/**
 * Main VitePress configuration
 * Ensures alignment with the custom theme and Tailwind CSS setup
 */
export default defineConfig({
  // Global site metadata
  title: 'Profile Weather View',
  description: 'Automated weather updates for your GitHub profile README',
  lang: 'en-US',
  lastUpdated: true,
  cleanUrls: true,
  ignoreDeadLinks: true,

  // SEO and metadata from meta.ts
  head,

  // Theme configuration - combining all UI elements
  themeConfig: {
    ...createThemeConfig(), // Load base theme settings

    // Navigation structure
    nav,
    sidebar,
    editLink,
    docFooter,

    // Social links
    socialLinks,

    // Footer content with optional customization support
    footer: createFooter(),

    // Search integration
    search,
  } as DefaultTheme.Config,

  // Markdown parsing and customization
  markdown,

  // Internationalization settings
  locales: createLocales(),

  // Sitemap for SEO
  sitemap,

  // Optimize a build process
  buildEnd: async () => {
    console.log('✅ VitePress site build completed successfully!');
  },

  // Vue-specific configurations
  vue: {
    template: {
      compilerOptions: {
        isCustomElement: (tag: string): boolean => tag === 'custom-element',
      },
    },
  },

  // Vite configuration, ensuring Tailwind is included
  vite: {
    plugins: [tailwindcss()],
  },
});
