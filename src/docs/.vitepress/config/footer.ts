/**
 * Footer configuration module for VitePress documentation site
 * Provides type-safe, customizable footer with enhanced functionality
 *
 * @module footer
 */

import type { DefaultTheme } from 'vitepress';

/**
 * Enhanced footer configuration with extended functionality
 * Builds upon VitePress default footer with additional options
 */
export interface FooterConfig extends DefaultTheme.Footer {
  /** The message shown right before copyright text - supports HTML */
  message: string;
  /** The copyright text - supports HTML */
  copyright: string;
  /** Direction for footer content in RTL languages */
  direction?: 'ltr' | 'rtl';
  /** Additional classes to apply to footer container */
  className?: string;
}

/**
 * Current year for dynamic copyright notice
 * Uses client timezone for consistent display
 */
const currentYear = new Date().getFullYear();

/**
 * Author information for copyright attribution
 */
const authorInfo = {
  name: 'Tashfiqul Islam',
  url: 'https://github.com/tashfiqul-islam',
};

/**
 * Default license information
 */
const licenseInfo = {
  name: 'MIT License',
  url: 'https://opensource.org/licenses/MIT',
};

/**
 * Default footer configuration with license and copyright information
 * Includes dynamic year calculation and linked attribution
 */
export const footer: FooterConfig = {
  message: `Released under the <a href="${licenseInfo.url}" target="_blank" rel="noopener noreferrer">${licenseInfo.name}</a>.`,
  copyright: `Copyright © ${currentYear} <a href="${authorInfo.url}" target="_blank" rel="noopener noreferrer">${authorInfo.name}</a>`,
  direction: 'ltr',
};

/**
 * Creates customized footer configuration with intelligent defaults
 *
 * @param options - Optional overrides for footer configuration
 * @returns Complete footer configuration with applied customizations
 *
 * @example
 * ```ts
 * // Basic usage with defaults
 * const defaultFooter = createFooter();
 *
 * // Custom message with default copyright
 * const customFooter = createFooter({
 *   message: 'Custom project message'
 * });
 * ```
 */
export const createFooter = (options?: Partial<FooterConfig>): FooterConfig => {
  return {
    ...footer,
    ...options,
  };
};

/**
 * Creates footer configuration with specified year range
 * Useful for projects that span multiple years
 *
 * @param startYear - Starting year for copyright range
 * @param options - Additional footer configuration options
 * @returns Footer configuration with year range in copyright
 */
export const createFooterWithYearRange = (
  startYear: number,
  options?: Partial<FooterConfig>,
): FooterConfig => {
  const yearRange =
    startYear < currentYear ? `${startYear}-${currentYear}` : `${currentYear}`;

  return {
    ...footer,
    copyright: `Copyright © ${yearRange} <a href="${authorInfo.url}" target="_blank" rel="noopener noreferrer">${authorInfo.name}</a>`,
    ...options,
  };
};
