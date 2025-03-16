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
  preference: 'auto', // Auto-detects system preference
  darkModeSwitchLabel: 'Theme', // Label for dark mode toggle
};

/**
 * Outline configuration for table of contents
 */
export const outline: DefaultTheme.Outline = {
  level: [2, 3], // Depth levels for the outline
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
  code: '', // Add Carbon Ads code here if applicable
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
    light: 'github-light', // Light mode syntax theme
    dark: 'github-dark', // Dark mode syntax theme
  },
  lineNumbers: true, // Enables line numbers for code blocks
  toc: { level: [2, 3] }, // Table of contents depth
};

/**
 * Tailwind Theme Colors - Aligns with VitePress branding
 */
export const tailwindTheme = {
  light: {
    background: 'bg-white',
    text: 'text-gray-900',
    border: 'border-gray-200',
  },
  dark: {
    background: 'bg-gray-900',
    text: 'text-gray-100',
    border: 'border-gray-700',
  },
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
  tailwindTheme: typeof tailwindTheme;
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
    tailwindTheme,
  };
};

//
