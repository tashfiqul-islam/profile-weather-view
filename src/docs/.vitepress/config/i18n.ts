/* src/docs/.vitepress/config/i18n.ts */

import type { DefaultTheme, LocaleConfig } from 'vitepress';

/**
 * Interface for locale configuration with enhanced options
 */
export interface LocaleOptions {
  label: string;
  lang: string;
  description?: string;
  themeConfig?: Partial<DefaultTheme.Config>;
}

/**
 * Available locales for the site
 * Add additional languages here as needed
 */
export const availableLocales: Record<string, LocaleOptions> = {
  root: {
    label: 'English',
    lang: 'en-US',
    description: 'Automated weather updates for your GitHub profile README',
  },
  // Example of additional language
  // 'es': {
  //   label: 'Español',
  //   lang: 'es-ES',
  //   description: 'Actualizaciones automáticas del clima para tu README de perfil de GitHub',
  // }
};

/**
 * Accessibility labels for language selector
 */
export const i18nLabels = {
  langMenuLabel: 'Change language',
  ariaSwitchLocale: 'Switch language',
};

/**
 * Common date format options for consistent date display across locales
 */
export const dateFormatOptions: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
};

/**
 * Creates VitePress locale configuration
 * @returns Configured locales object
 */
export const createLocales = (): LocaleConfig => {
  return Object.entries(availableLocales).reduce(
    (localesConfig, [key, locale]) => {
      localesConfig[key] = {
        label: locale.label,
        lang: locale.lang,
        description: locale.description,
        themeConfig: locale.themeConfig,
      };
      return localesConfig;
    },
    {} as LocaleConfig,
  );
};

/**
 * Default locale configuration for direct import into config
 */
export const locales = createLocales();
