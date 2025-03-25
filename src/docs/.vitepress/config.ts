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
import { createSitemap, createHeadTags } from './config/seo';
import { head } from './config/meta';
import socialLinks from './config/social';

// Path resolution based on project structure
const ROOT_DIR = resolve(process.cwd());
const SRC_DIR = resolve(ROOT_DIR, 'src');
const DOCS_DIR = resolve(SRC_DIR, 'docs');

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

export default defineConfig({
  // Base site configuration
  title: 'Profile Weather View',
  description: 'Automated weather updates for your GitHub profile README',
  lang: 'en-US',
  lastUpdated: true,
  base: '/',

  // Internationalization
  locales,

  // Head metadata
  head: [...head, ...FONT_PRELOADS, ...createHeadTags()],

  // Markdown processing
  markdown,

  // SEO configuration
  sitemap: createSitemap() as any,

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
    plugins: [tailwindcss()],

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
            theme: ['./theme/index.ts'],
            vue: ['vue', 'vue-router'],
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

  // Add reading time to pages
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
