import type { UserConfig } from 'vitepress';
import path from 'node:path';

import { head } from './config/meta';
import { nav, sidebar, editLink, docFooter } from './config/nav';
import { search } from './config/search';
import { markdown } from './config/markdown';
import { sitemap } from './config/seo';
import { locales } from './config/i18n';
import { createFooter } from './config/footer';
import socialLinks from './config/social';

const srcAlias: string = path.join(process.cwd(), 'src');

const config: UserConfig = {
  title: 'Profile Weather View',
  description: 'Automated weather updates for your GitHub profile README',
  lang: 'en-US',
  locales,
  head,
  markdown,
  sitemap,
  lastUpdated: true,

  // Theme configuration
  themeConfig: {
    nav,
    sidebar,
    editLink,
    docFooter,
    footer: createFooter(),
    search,
    socialLinks,
    // Enable dark mode toggle
    appearance: {
      preference: 'auto',
      darkModeSwitchLabel: 'Theme',
    },
    // Outline configuration for better navigation
    outline: {
      level: [2, 3],
      label: 'On this page',
    },
    lastUpdated: {
      text: 'Last Updated',
      formatOptions: {
        dateStyle: 'medium',
        timeStyle: 'short',
      },
    },
  },

  // Build and optimization settings
  vite: {
    resolve: {
      alias: {
        '@': srcAlias,
      },
    },
    // Bun-optimized settings
    optimizeDeps: {
      include: ['tailwindcss'],
      // Using Bun's faster dependency optimization
      force: process.env.NODE_ENV === 'development',
    },
    server: {
      hmr: { overlay: true },
      // Bun's fast fs module for better file watching
      fs: {
        strict: false,
        allow: ['..'],
      },
    },
    css: {
      transformer: 'lightningcss',
      // LightningCSS is well-suited for Bun's performance goals
      lightningcss: {},
      // Keep the postcss plugin structure but remove the CSS content
      postcss: {
        plugins: [],
      },
    },
    build: {
      minify: 'esbuild',
      sourcemap: process.env.NODE_ENV !== 'production',
      target: 'esnext',
      // Optimize for modern browsers only - safe with Bun
      cssMinify: 'lightningcss',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['tailwindcss'],
            theme: ['./theme/index.ts'],
          },
          // Better caching with content-hashing
          chunkFileNames: 'assets/chunks/[name].[hash].js',
          entryFileNames: 'assets/entries/[name].[hash].js',
          assetFileNames: 'assets/[name].[hash].[ext]',
        },
      },
    },
    // Add Bun-specific environment variables
    define: {
      'import.meta.env.BUN_VERSION': JSON.stringify(
        process.versions.bun || 'unknown',
      ),
    },
    // Move esbuild config to the root level
    esbuild: {
      target: 'esnext',
      platform: 'browser',
      legalComments: 'none',
    },
  },

  // Modern URL format without .html extension
  cleanUrls: true,

  // Extract metadata to separate chunk for better caching
  metaChunk: true,

  // Font optimization
  transformHead() {
    const fontFiles = [
      '/fonts/RopaSans-Regular.woff2',
      '/fonts/RopaSans-Italic.woff2',
    ];
    return fontFiles.map((font) => [
      'link',
      {
        rel: 'preload',
        href: font,
        as: 'font',
        type: 'font/woff2',
        crossorigin: '',
      },
    ]);
  },

  // Files to exclude from documentation
  srcExclude: [
    '**/README.md',
    '**/CHANGELOG.md',
    '**/*.test.{js,ts}',
    '**/*.spec.{js,ts}',
    '**/*.d.ts',
    '**/node_modules/**',
  ],

  // Better-caching strategy
  cacheDir: './.vitepress/cache',
};

export default config;
