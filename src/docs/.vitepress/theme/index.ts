/**
 * index.ts
 * Main entry point for VitePress theme customization
 */

import { type Theme, inBrowser } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import './custom.css';

// Import any custom components here
// import CustomComponent from './components/CustomComponent.vue';

// Any theme enhancement configuration can be done here
export default {
  ...DefaultTheme,

  enhanceApp({ app, router, siteData }) {
    // Register custom components
    // app.component('CustomComponent', CustomComponent);

    // Add any app-level enhancements
    if (inBrowser) {
      // Client-side-only code
      router.onAfterRouteChanged = (to) => {
        // Analytics tracking code can go here
        console.log('Route changed to:', to);
      };

      // Initialize any client-side libraries
      // Example: initialize tooltips, etc.
      window.addEventListener('DOMContentLoaded', () => {
        // Initialize any features that require DOM to be loaded
      });
    }
  },
} satisfies Theme;
