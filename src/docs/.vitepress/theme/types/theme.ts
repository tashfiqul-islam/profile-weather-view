/**
 * Extended theme type definitions
 * Provides type safety for custom theme configuration
 */

import type { DefaultTheme } from 'vitepress';
import type { Component, Plugin } from 'vue';

/**
 * Extended theme configuration with additional options
 */
export interface ExtendedThemeConfig extends DefaultTheme.Config {
  /**
   * Theme appearance preference
   * @default 'auto'
   */
  appearance?: 'auto' | 'dark' | 'light';

  /**
   * Global Vue components to register
   */
  globalComponents?: Record<string, Component>;

  /**
   * Vue plugins to apply to the VitePress app
   */
  plugins?: (Plugin | ((app: any) => void))[];

  /**
   * Versioning options
   */
  versioning?: {
    /**
     * Whether to enable version selector
     * @default true
     */
    enabled?: boolean;

    /**
     * Default version to use when none is specified
     * @default 'latest'
     */
    defaultVersion?: string;

    /**
     * Whether to show version badges in documentation
     * @default true
     */
    showBadges?: boolean;
  };
}
