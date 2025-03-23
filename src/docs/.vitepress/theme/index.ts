import DefaultTheme from 'vitepress/theme-without-fonts';
import type { Theme } from 'vitepress';
import type { EnhanceAppContext } from 'vitepress';

// Import custom styles
import './styles/font.css';
import './styles/tailwind.css';

// Import theme configuration
import { createThemeConfig } from '../config/theme';

/**
 * Enhanced VitePress Theme Configuration
 * Implements advanced performance and accessibility features
 */
export default {
  /**
   * Extend default VitePress theme
   */
  extends: DefaultTheme,

  /**
   * Theme configuration from existing settings
   */
  ...createThemeConfig(),

  /**
   * Enhanced app initialization
   * Provides hooks for global component registration and plugin initialization
   */
  enhanceApp(ctx: EnhanceAppContext) {
    const { app } = ctx;

    // Optional: Add global components
    // Example: app.component('GlobalComponent', GlobalComponent);

    // Optional: Add global error handling
    app.config.errorHandler = (err, instance, info) => {
      console.error('Global Error Handler:', {
        error: err,
        instance,
        info,
      });
    };

    // Return void or a promise resolving to void to match VitePress theme type
    return Promise.resolve();
  },
} satisfies Theme;
