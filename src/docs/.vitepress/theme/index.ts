/**
 * Custom VitePress theme with versioning support
 * Extends the default theme with version-aware components and styles
 */

import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import { VPBadge } from 'vitepress/theme';
import Layout from './styles/components/Layout.vue';
import VersionSelector from './styles/components/VersionSelector.vue';
import type { ExtendedThemeConfig } from './types/theme';

// Import styles
import './styles/tailwind.css';
import './styles/navbar.css';
import './styles/home.css';
import './styles/font.css';
import './styles/versions.css';

/**
 * Creates a customized VitePress theme with versioning support
 *
 * @param config - Optional extended theme configuration
 * @returns Configured VitePress theme with version components
 */
export function createTheme(config: Partial<ExtendedThemeConfig> = {}): Theme {
  return {
    ...DefaultTheme,
    Layout,
    enhanceApp({ app }) {
      // Register global components
      app.component('Badge', VPBadge);
      app.component('VersionSelector', VersionSelector);

      // Register additional global components if provided
      if (config.globalComponents) {
        Object.entries(config.globalComponents).forEach(([name, component]) => {
          app.component(name, component);
        });
      }

      // Apply custom plugins if provided
      if (config.plugins) {
        config.plugins.forEach((plugin) => {
          if (typeof plugin === 'function') {
            plugin(app);
          } else if (
            typeof plugin === 'object' &&
            plugin !== null &&
            typeof plugin.install === 'function'
          ) {
            app.use(plugin);
          }
        });
      }
    },
  };
}

export * from './types/theme';
export default createTheme();
