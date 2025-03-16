/* src/docs/.vitepress/config/nav.ts */

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
      },
      {
        text: 'Changelog',
        link: 'https://github.com/tashfiqul-islam/profile-weather-view/blob/main/CHANGELOG.md',
      },
      {
        text: 'Contributing',
        link: 'https://github.com/tashfiqul-islam/profile-weather-view/blob/main/.github/contributing.md',
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
