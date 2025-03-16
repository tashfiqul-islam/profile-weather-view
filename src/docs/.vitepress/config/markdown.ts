/* src/docs/.vitepress/config/markdown.ts */

import type { MarkdownOptions } from 'vitepress';
import MarkdownIt from 'markdown-it';

/**
 * Supported syntax highlighting themes
 */
export const HighlightTheme = {
  GITHUB: 'github-light',
  GITHUB_DARK: 'github-dark',
  DRACULA: 'dracula',
  MATERIAL_PALENIGHT: 'material-palenight',
  MATERIAL_DARKER: 'material-dark',
  ONE_DARK_PRO: 'one-dark-pro',
  VS_CODE_LIGHT: 'vitesse-light',
  VS_CODE_DARK: 'vitesse-dark',
} as const;

/**
 * Extend Markdown-It configuration
 * @param md - Markdown-It instance
 */
const extendMarkdownIt = (md: MarkdownIt) => {
  // Custom Markdown-It plugins can be added here
};

/**
 * Creates markdown configuration with custom options
 * @returns Configured markdown options
 */
export const createMarkdownConfig = (): MarkdownOptions => {
  return {
    theme: {
      light: HighlightTheme.GITHUB,
      dark: HighlightTheme.GITHUB_DARK,
    },
    lineNumbers: true,
    toc: {
      level: [2, 3],
    },
    config: (md) => extendMarkdownIt(md),
  };
};

/**
 * Default markdown configuration for direct import into config
 */
export const markdown: MarkdownOptions = createMarkdownConfig();
