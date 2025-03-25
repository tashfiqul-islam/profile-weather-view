import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import { VPBadge } from 'vitepress/theme';
import type { ExtendedThemeConfig } from './types/theme';

import './styles/font.css';
import './styles/home.css';
import './styles/tailwind.css';

export function createTheme(config: Partial<ExtendedThemeConfig> = {}): Theme {
  return {
    ...DefaultTheme,
    enhanceApp({ app }) {
      // Register Badge component globally
      app.component('Badge', VPBadge);

      // Register global components if provided
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
          } else if (plugin.install) {
            plugin.install(app);
          }
        });
      }
    },
  };
}

export * from './types/theme';
export default createTheme();
