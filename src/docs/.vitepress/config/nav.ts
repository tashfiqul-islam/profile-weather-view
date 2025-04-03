/**
 * Navigation configuration module for VitePress documentation
 * Advanced version-aware, type-safe navigation system
 *
 * @module navigation
 */

import type { DefaultTheme } from 'vitepress';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { NextFunction } from 'connect';
import { VERSION_CONFIG, VERSION_STATE, getVersionPath } from '../version';

// Enhanced type definitions (keeping existing ones)
export interface SVGIcon {
  svg: string;
  title?: string;
  width?: number | string;
  height?: number | string;
  className?: string;
}

export interface NavItemWithIcon extends DefaultTheme.NavItemWithLink {
  icon?: SVGIcon;
  external?: boolean;
  tooltip?: string;
  badge?: {
    text: string;
    type?: 'info' | 'tip' | 'warning' | 'danger';
  };
}

export interface NavItemWithChildrenAndIcons
  extends Omit<DefaultTheme.NavItemWithChildren, 'items'> {
  items: (NavItemWithIcon | DefaultTheme.NavItem)[];
  dividers?: Array<{
    after: number;
    label?: string;
  }>;
  icon?: SVGIcon;
}

export interface EnhancedSidebarItem extends DefaultTheme.SidebarItem {
  icon?: SVGIcon;
  badge?: {
    text: string;
    type?: 'info' | 'tip' | 'warning' | 'danger';
  };
  tooltip?: string;
}

// Existing type guards
export const hasIcon = (
  item: DefaultTheme.NavItem | NavItemWithIcon,
): item is NavItemWithIcon => {
  return 'icon' in item && item.icon !== undefined;
};

export const isDropdown = (
  item: DefaultTheme.NavItem | NavItemWithChildrenAndIcons,
): item is NavItemWithChildrenAndIcons | DefaultTheme.NavItemWithChildren => {
  return 'items' in item && Array.isArray(item.items);
};

export const hasSidebarItems = (
  item: DefaultTheme.SidebarItem,
): item is DefaultTheme.SidebarItem & { items: DefaultTheme.SidebarItem[] } => {
  return 'items' in item && Array.isArray(item.items);
};

/**
 * Navigation configuration with version support
 */
const navigationItems = {
  main: [
    { text: 'Home', link: '/' },
    {
      text: 'Guide',
      link: '/guide/introduction',
      activeMatch: '^/guide/',
    },
    {
      text: 'Reference',
      link: '/reference/api-reference',
      activeMatch: '^/reference/',
    },
  ],

  resources: [
    {
      text: 'Resources',
      items: [
        {
          text: 'GitHub Repository',
          link: 'https://github.com/tashfiqul-islam/profile-weather-view',
          external: true,
        },
        {
          text: 'Changelog',
          link: 'https://github.com/tashfiqul-islam/profile-weather-view/blob/main/CHANGELOG.md',
          external: true,
        },
        {
          text: 'Contributing',
          link: 'https://github.com/tashfiqul-islam/profile-weather-view/blob/main/.github/contributing.md',
          external: true,
        },
      ],
    },
  ],
};

/**
 * Comprehensive navigation configuration
 */
export const nav: (DefaultTheme.NavItem | NavItemWithChildrenAndIcons)[] = [
  ...navigationItems.main,
  ...navigationItems.resources,
];

/**
 * Create a middleware to handle version routing
 * Prevents 404 on special version routes by redirecting early
 */
export const createVersionMiddleware = () => {
  return (req: IncomingMessage, res: ServerResponse, next: NextFunction) => {
    // Check against all special routes
    const specialRoutes = Object.values(VERSION_CONFIG.ROUTES);

    if (
      req.url &&
      specialRoutes.some(
        (route) =>
          req.url === route ||
          req.url === `${route.slice(0, -1)}` ||
          (req.url && req.url.startsWith(route)),
      )
    ) {
      req.url = getVersionPath(VERSION_STATE.LATEST);
    }

    next();
  };
};

// Sidebar configuration with version awareness
export const createSidebar = (options?: {
  collapseGuide?: boolean;
  collapseReference?: boolean;
  additionalSections?: Record<string, DefaultTheme.SidebarItem[]>;
}): DefaultTheme.Sidebar => {
  // Existing sidebar logic
  const customSidebar: DefaultTheme.Sidebar = {
    '/guide/': [
      {
        text: `🚀 Guide (v${VERSION_STATE.LATEST})`,
        items: [
          { text: 'Introduction', link: '/guide/introduction' },
          { text: 'System Architecture', link: '/guide/architecture' },
          { text: 'Customization', link: '/guide/customization' },
        ],
      },
    ],
    '/reference/': [
      {
        text: `📖 Reference (v${VERSION_STATE.LATEST})`,
        items: [
          { text: 'API Overview', link: '/reference/api-reference' },
          { text: 'Configuration', link: '/reference/configuration' },
        ],
      },
    ],
  };

  // Apply additional customization options
  if (options?.collapseGuide) {
    Object.values(customSidebar).forEach((sections) => {
      if (Array.isArray(sections)) {
        sections.forEach((section) => {
          if ('collapsed' in section) section.collapsed = true;
        });
      }
    });
  }

  // Merge additional sections if provided
  if (options?.additionalSections) {
    Object.entries(options.additionalSections).forEach(([path, items]) => {
      customSidebar[path] = items;
    });
  }

  return customSidebar;
};

// Default sidebar
export const sidebar = createSidebar();

// Edit link configuration
export const editLink = {
  pattern:
    'https://github.com/tashfiqul-islam/profile-weather-view/edit/main/docs/:path',
  text: 'Edit this page on GitHub',
};

// Document footer navigation
export const docFooter = {
  prev: 'Previous page',
  next: 'Next page',
};

// Utility for creating nav items with badges
export const createNavItemWithBadge = (
  text: string,
  link: string,
  badgeText: string,
  badgeType: 'info' | 'tip' | 'warning' | 'danger' = 'info',
): NavItemWithIcon => ({
  text,
  link,
  badge: {
    text: badgeText,
    type: badgeType,
  },
});

export default {
  nav,
  sidebar,
  editLink,
  docFooter,
  createSidebar,
  createVersionMiddleware,
};
