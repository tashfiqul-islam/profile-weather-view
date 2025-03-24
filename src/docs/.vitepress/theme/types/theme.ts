import type { DefaultTheme } from 'vitepress';
import type { Component, Plugin } from 'vue';

export interface ExtendedThemeConfig extends DefaultTheme.Config {
  appearance?: 'default' | 'dark' | 'light';
  globalComponents?: Record<string, Component>;
  plugins?: Plugin[];
}
