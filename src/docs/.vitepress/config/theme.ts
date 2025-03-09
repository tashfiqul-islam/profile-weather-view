/**
 * theme.ts
 * Contains theme-related configurations including appearance, colors, and visual elements
 */

import type { DefaultTheme } from 'vitepress';

/**
 * Type for logo configuration with light and dark mode variants
 */
export interface LogoConfig {
  light: string;
  dark: string;
}

/**
 * Interface for appearance configuration with enhanced type safety
 */
export interface AppearanceConfig {
  preference: 'auto' | 'dark' | 'light';
  darkModeSwitchLabel: string;
}

/**
 * Type for LastUpdated configuration with format options
 */
export interface LastUpdatedConfig extends DefaultTheme.LastUpdatedOptions {
  text: string;
  formatOptions: Intl.DateTimeFormatOptions;
}

/**
 * Configure logo for the site header
 */
export const logo: LogoConfig = {
  light: '/icons/weather.svg',
  dark: '/icons/weather.svg',
};

/**
 * Site title configuration
 */
export const siteTitle: string = 'Profile Weather View';

/**
 * Dark/light mode appearance settings
 */
export const appearance: AppearanceConfig = {
  preference: 'auto',
  darkModeSwitchLabel: 'Theme',
};

/**
 * Outline configuration
 */
export const outline: DefaultTheme.Outline = {
  level: [2, 3],
  label: 'On this page',
};

/**
 * Last updated timestamp configuration
 */
export const lastUpdated: LastUpdatedConfig = {
  text: 'Updated at',
  formatOptions: {
    dateStyle: 'full',
    timeStyle: 'medium',
  },
};

/**
 * Configure Carbon Ads (optional revenue source)
 */
export const carbonAds: DefaultTheme.CarbonAdsOptions = {
  code: '', // Add Carbon Ads code here
  placement: '',
};

/**
 * Accessibility labels
 */
export const accessibilityLabels = {
  langMenuLabel: 'Change language',
  returnToTopLabel: 'Back to top',
  sidebarMenuLabel: 'Menu',
};

/**
 * External links behavior
 */
export const externalLinkIcon: boolean = true;

/**
 * Markdown configuration for code blocks
 */
export const markdown = {
  theme: {
    light: 'github-light',
    dark: 'github-dark',
  },
  lineNumbers: true,
  toc: { level: [2, 3] },
};

/**
 * Create a complete theme configuration object
 */
export const createThemeConfig = (): {
  logo: LogoConfig;
  siteTitle: string;
  appearance: AppearanceConfig;
  outline: DefaultTheme.Outline;
  lastUpdated: LastUpdatedConfig;
  carbonAds: DefaultTheme.CarbonAdsOptions;
  langMenuLabel: string;
  returnToTopLabel: string;
  sidebarMenuLabel: string;
  externalLinkIcon: boolean;
} => {
  return {
    logo,
    siteTitle,
    appearance,
    outline,
    lastUpdated,
    carbonAds,
    langMenuLabel: accessibilityLabels.langMenuLabel,
    returnToTopLabel: accessibilityLabels.returnToTopLabel,
    sidebarMenuLabel: accessibilityLabels.sidebarMenuLabel,
    externalLinkIcon,
  };
};
