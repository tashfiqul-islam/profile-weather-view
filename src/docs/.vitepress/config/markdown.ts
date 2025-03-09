/**
 * markdown.ts
 * Contains configuration for Markdown processing and code syntax highlighting
 */

import type { MarkdownOptions } from 'vitepress';

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
      // Note: containerClass and listClass were causing TypeScript errors with exactOptionalPropertyTypes
      // Removed to maintain compatibility
    },
  };
};

/**
 * Default markdown configuration for direct import into config
 */
export const markdown: MarkdownOptions = createMarkdownConfig();
