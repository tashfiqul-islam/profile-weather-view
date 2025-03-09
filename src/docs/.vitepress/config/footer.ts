/**
 * footer.ts
 * Contains footer configuration for the VitePress site
 */

import type { DefaultTheme } from 'vitepress';

/**
 * Interface for footer configuration with enhanced options
 */
export interface FooterConfig extends DefaultTheme.Footer {
  message: string;
  copyright: string;
}

/**
 * Current year for copyright notice
 */
const currentYear = new Date().getFullYear();

/**
 * Author name for copyright notice
 */
const authorName = 'Tashfiqul Islam';

/**
 * Footer configuration with license and copyright information
 */
export const footer: FooterConfig = {
  message: 'Released under the MIT License.',
  copyright: `Copyright © ${currentYear} ${authorName}`,
};

/**
 * Creates customized footer configuration
 * @param options - Optional overrides for footer text
 * @returns Configured footer object
 */
export const createFooter = (options?: Partial<FooterConfig>): FooterConfig => {
  return {
    ...footer,
    ...options,
  };
};

/**
 * Default export for direct import into config
 */
export default footer;
