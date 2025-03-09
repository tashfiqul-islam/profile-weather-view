/**
 * nav.ts
 * Contains navigation, sidebar, and link configurations
 */

import type { DefaultTheme } from 'vitepress';

/**
 * Custom SVG icon type for navigation items
 */
export interface SVGIcon {
  svg: string;
}

/**
 * Type for main navigation items with optional SVG icons
 */
export interface NavItemWithIcon extends DefaultTheme.NavItemWithLink {
  icon?: SVGIcon;
}

/**
 * Interface for dropdown navigation items with icons
 */
export interface NavItemWithChildrenAndIcons
  extends Omit<DefaultTheme.NavItemWithChildren, 'items'> {
  items: (NavItemWithIcon | DefaultTheme.NavItem)[];
}

/**
 * Type guard to check if a NavItem has custom icons
 */
export const hasIcon = (
  item: DefaultTheme.NavItem | NavItemWithIcon,
): item is NavItemWithIcon => {
  return 'icon' in item && item.icon !== undefined;
};

/**
 * Main navigation configuration
 */
export const nav: (DefaultTheme.NavItem | NavItemWithChildrenAndIcons)[] = [
  { text: 'Home', link: '/' },
  {
    text: 'Guide',
    link: '/guide/introduction',
    activeMatch: '/guide/',
  },
  {
    text: 'Reference',
    link: '/reference/api-reference',
    activeMatch: '/reference/',
  },
  {
    text: 'Resources',
    items: [
      {
        text: 'GitHub Repository',
        link: 'https://github.com/tashfiqul-islam/profile-weather-view',
        icon: {
          svg: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path fill="currentColor" d="M8 0a8 8 0 0 0-8 8a8.14 8.14 0 0 0 5.47 7.59c.4.07.55-.17.55-.38c0-.19-.01-.82-.01-1.49c-2.01.37-2.53-.49-2.69-.94c-.09-.23-.48-.94-.82-1.13c-.28-.15-.68-.52-.01-.53c.63-.01 1.08.58 1.23.82c.72 1.21 1.87.87 2.33.66c.07-.52.28-.87.51-1.07c-1.78-.2-3.64-.89-3.64-3.95c0-.87.31-1.59.82-2.15c-.08-.2-.36-1.02.08-2.12c0 0 .67-.21 2.2.82a7.42 7.42 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82c.44 1.1.16 1.92.08 2.12c.51.56.82 1.27.82 2.15c0 3.07-1.87 3.75-3.65 3.95c.29.25.54.73.54 1.48c0 1.07-.01 1.93-.01 2.2c0 .21.15.46.55.38A8.15 8.15 0 0 0 16 8a8 8 0 0 0-8-8Z"/></svg>',
        },
      },
      {
        text: 'Changelog',
        link: 'https://github.com/tashfiqul-islam/profile-weather-view/blob/main/CHANGELOG.md',
        icon: {
          svg: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path fill="currentColor" d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0ZM2.04 7.5h1.42c.04-1.12.28-2.16.71-3.06c.44-.91 1.04-1.74 1.78-2.43c-1.73.72-3.07 2.19-3.91 4.04v1.45Zm1.42 1H2.04v.5c.84 1.85 2.18 3.32 3.91 4.04a8.206 8.206 0 0 1-1.78-2.43c-.43-.9-.67-1.94-.71-3.06V8.5ZM8 14.5c-.8 0-1.57-.21-2.23-.6c.27-.35.51-.72.72-1.11c.46-.87.76-1.82.86-2.79H8v4.5Zm0-5.5H7.35c-.11-1.09-.43-2.13-.94-3.07c-.5-.93-1.14-1.73-1.87-2.33c.96-.38 2-.6 3.1-.6h.36v6Zm0-7H7.64c-1.1 0-2.14.22-3.1.6c.73-.6 1.37-1.4 1.87-2.33c.51-.94.83-1.98.94-3.07H8v4.8Zm0 5.8h.65c.1.97.4 1.92.86 2.79c.21.39.45.76.72 1.11c-.66.39-1.43.6-2.23.6V8.5Zm2.13-6.5c.73.6 1.37 1.4 1.87 2.33c.51.94.83 1.98.94 3.07H8.34V2c1.1 0 2.14.22 3.1.6a6.85 6.85 0 0 0-1.31 1.6Zm2.37 6.5c-.11 1.09-.43 2.13-.94 3.07c-.5.93-1.14 1.73-1.87 2.33c.96.38 2 .6 3.1.6H12v-6h.5ZM13.96 8v.5h-1.42c-.04 1.12-.28 2.16-.71 3.06c-.44.91-1.04 1.74-1.78 2.43c1.73-.72 3.07-2.19 3.91-4.04V8.5ZM10.05 2.01c.74.69 1.34 1.52 1.78 2.43c.43.9.67 1.94.71 3.06h1.42v-.5c-.84-1.85-2.18-3.32-3.91-4.04v-.95Z"/></svg>',
        },
      },
      {
        text: 'Contributing',
        link: 'https://github.com/tashfiqul-islam/profile-weather-view/blob/main/.github/contributing.md',
        icon: {
          svg: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59c.4.07.55-.17.55-.38c0-.19-.01-.82-.01-1.49c-2.01.37-2.53-.49-2.69-.94c-.09-.23-.48-.94-.82-1.13c-.28-.15-.68-.52-.01-.53c.63-.01 1.08.58 1.23.82c.72 1.21 1.87.87 2.33.66c.07-.52.28-.87.51-1.07c-1.78-.2-3.64-.89-3.64-3.95c0-.87.31-1.59.82-2.15c-.08-.2-.36-1.02.08-2.12c0 0 .67-.21 2.2.82a7.55 7.55 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82c.44 1.1.16 1.92.08 2.12c.51.56.82 1.27.82 2.15c0 3.07-1.87 3.75-3.65 3.95c.29.25.54.73.54 1.48c0 1.07-.01 1.93-.01 2.2c0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>',
        },
      },
    ],
  },
];

/**
 * Sidebar configuration with collapsible sections
 */
export const sidebar: DefaultTheme.Sidebar = {
  '/guide/': [
    {
      text: '🚀 Getting Started',
      collapsed: false,
      items: [
        { text: 'Introduction', link: '/guide/introduction' },
        { text: 'System Architecture', link: '/guide/architecture' },
        { text: 'Customization', link: '/guide/customization' },
        { text: 'Theme Integration', link: '/guide/theme-integration' },
      ],
    },
    {
      text: '⚙️ Advanced Topics',
      collapsed: false,
      items: [
        { text: 'CI/CD Deployment', link: '/guide/deployment' },
        { text: 'Comprehensive Testing', link: '/guide/testing' },
        { text: 'Troubleshooting', link: '/guide/troubleshooting' },
      ],
    },
  ],
  '/reference/': [
    {
      text: '📖 API Reference',
      collapsed: false,
      items: [
        { text: 'API Overview', link: '/reference/api-reference' },
        { text: 'Configuration Options', link: '/reference/configuration' },
      ],
    },
  ],
};

/**
 * Edit link configuration
 */
export const editLink: DefaultTheme.EditLink = {
  pattern:
    'https://github.com/tashfiqul-islam/profile-weather-view/edit/main/docs/:path',
  text: 'Edit this page on GitHub',
};

/**
 * Doc footer navigation labels
 */
export const docFooter: DefaultTheme.DocFooter = {
  prev: 'Previous page',
  next: 'Next page',
};
