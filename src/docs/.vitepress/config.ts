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
  locales,
  head,
  markdown,
  sitemap,
  themeConfig: {
    nav,
    sidebar,
    editLink,
    docFooter,
    footer: createFooter(),
    search,
    socialLinks,
  },
  vite: {
    resolve: {
      alias: {
        '@': srcAlias,
      },
    },
    optimizeDeps: {
      include: ['tailwindcss'],
    },
    server: {
      hmr: { overlay: true },
    },
    css: { transformer: 'lightningcss' },
    build: {
      minify: 'esbuild',
      sourcemap: false,
      target: 'esnext',
      rollupOptions: {
        output: { manualChunks: { vendor: ['tailwindcss'] } },
      },
    },
  },
  cleanUrls: true,
  metaChunk: true,
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
  srcExclude: [
    '**/README.md',
    '**/CHANGELOG.md',
    '**/*.test.{js,ts}',
    '**/*.spec.{js,ts}',
  ],
};

export default config;
