/* src/docs/.vitepress/config.ts */

import { defineConfig } from 'vitepress';
import type { DefaultTheme } from 'vitepress';
import tailwindcss from '@tailwindcss/vite';

// Import modular configurations using path aliases
import { head } from '@/docs/.vitepress/config/meta';
import {
  nav,
  sidebar,
  editLink,
  docFooter,
} from '@/docs/.vitepress/config/nav';
import { createThemeConfig } from '@/docs/.vitepress/config/theme';
import { socialLinks } from '@/docs/.vitepress/config/social';
import { footer, createFooter } from '@/docs/.vitepress/config/footer';
import { markdown } from '@/docs/.vitepress/config/markdown';
import { search } from '@/docs/.vitepress/config/search';
import { sitemap } from '@/docs/.vitepress/config/seo';
import { createLocales } from '@/docs/.vitepress/config/i18n';

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
    resolve: {
      alias: {
        '@': '/src',
      },
    },
  },
});
