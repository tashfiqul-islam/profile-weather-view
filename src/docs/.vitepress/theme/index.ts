/* src/docs/.vitepress/theme/index.ts */

import { type Theme, inBrowser } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import './tailwind.css';

/**
 * Custom VitePress theme with enhanced performance,
 * modern UI, and smooth dark/light mode transitions.
 */
const theme: Theme = {
  ...DefaultTheme,
  enhanceApp({ app, router }) {
    if (inBrowser) {
      // Handle route changes (useful for analytics, logging, etc.)
      router.onAfterRouteChange = (to) => {
        console.log('Navigated to:', to);
      };
    }
  },
};

export default theme;
