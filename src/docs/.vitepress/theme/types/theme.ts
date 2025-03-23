import type { DefaultTheme } from 'vitepress';
import type { App, Component } from 'vue';
import type { Router, RouteLocationNormalized } from 'vue-router';

/**
 * Navigation tracking context for analytics and monitoring
 */
export interface NavigationTrackingContext {
  /**
   * Current page path
   */
  path: string;

  /**
   * Previous page path
   */
  previousPath: string;

  /**
   * Timestamp of navigation event
   */
  timestamp: number;

  /**
   * Additional metadata about the navigation
   */
  meta?: Record<string, unknown>;
}

/**
 * Analytics tracking provider interface
 */
export type AnalyticsProvider = (context: NavigationTrackingContext) => void;

/**
 * Navigation tracking configuration options
 */
export interface NavigationTrackingOptions {
  /**
   * Toggle tracking on/off
   */
  enabled: boolean;

  /**
   * Tracking providers to be called on navigation
   */
  providers: AnalyticsProvider[];

  /**
   * Custom filtering or conditions for tracking
   */
  filter?: (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
  ) => boolean;
}

/**
 * Font Configuration Specific to Ropa Sans Typography
 */
export interface FontConfiguration {
  /**
   * Primary sans-serif font family (Ropa Sans)
   */
  sans: string[];

  /**
   * Body text font family (Ropa Sans)
   */
  body: string[];

  /**
   * Monospace font for code
   */
  mono: string[];

  /**
   * Font weights for Ropa Sans
   */
  weights: {
    normal: 400;
    medium: 500;
    semibold: 600;
    bold: 700;
  };

  /**
   * Typography scale and spacing
   */
  scale: {
    lineHeights: {
      none: 1;
      tight: 1.25;
      snug: 1.375;
      normal: 1.5;
      relaxed: 1.75;
      loose: 2;
    };

    letterSpacing: {
      tighter: '-0.05em';
      tight: '-0.025em';
      normal: '0em';
      wide: '0.025em';
      wider: '0.05em';
      widest: '0.1em';
    };
  };
}

/**
 * Extended theme configuration interface
 */
export interface ExtendedThemeConfig extends DefaultTheme.Config {
  /**
   * Custom Ropa Sans typography configuration
   */
  typography?: FontConfiguration;

  /**
   * Existing configuration properties remain unchanged
   */
  navigationTracking?: NavigationTrackingOptions;
  globalComponents?: Record<string, Component>;
  plugins?: Array<(app: App) => void>;
}

/**
 * Theme enhancement context
 */
export interface ThemeEnhanceContext {
  /**
   * Vue application instance
   */
  app: App;

  /**
   * Vue Router instance
   */
  router: Router;
}

/**
 * Performance tracking metrics
 */
export interface PerformanceMetric {
  /**
   * Name of the performance metric
   */
  name: string;

  /**
   * Duration of the metric
   */
  duration: number;

  /**
   * Additional performance data
   */
  details?: Record<string, unknown>;
}

/**
 * Error tracking interface
 */
export interface ErrorTrackingOptions {
  /**
   * Enable or disable error tracking
   */
  enabled: boolean;

  /**
   * Error reporting providers
   */
  providers: Array<(error: Error) => void>;

  /**
   * Custom error filtering
   */
  filter?: (error: Error) => boolean;
}

/**
 * Accessibility configuration
 */
export interface AccessibilityConfig {
  /**
   * Enable enhanced accessibility features
   */
  enhanced: boolean;

  /**
   * Custom accessibility labels
   */
  labels?: Record<string, string>;

  /**
   * Keyboard navigation options
   */
  keyboardNavigation?: {
    enabled: boolean;
    customShortcuts?: Record<string, () => void>;
  };
}

/**
 * Theme extension options
 */
export interface ThemeExtensionOptions {
  /**
   * Navigation tracking configuration
   */
  navigationTracking?: NavigationTrackingOptions;

  /**
   * Error tracking configuration
   */
  errorTracking?: ErrorTrackingOptions;

  /**
   * Accessibility configurations
   */
  accessibility?: AccessibilityConfig;
}
