/**
 * Navigation configuration module for VitePress documentation
 * Provides comprehensive, type-safe navigation structures with advanced customization
 *
 * @module navigation
 */

import type { DefaultTheme } from 'vitepress';

/**
 * SVG icon configuration for navigation elements
 * Enables embedding custom vector graphics in navigation items
 */
export interface SVGIcon {
  /** Raw SVG content string (must include xmlns attribute) */
  svg: string;
  /** Optional title for accessibility */
  title?: string;
  /** Optional width attribute */
  width?: number | string;
  /** Optional height attribute */
  height?: number | string;
  /** Optional CSS classes to apply to the SVG */
  className?: string;
}

/**
 * Navigation item with enhanced icon support
 * Extends the standard VitePress navigation item with additional capabilities
 */
export interface NavItemWithIcon extends DefaultTheme.NavItemWithLink {
  /** Custom SVG icon configuration */
  icon?: SVGIcon;
  /** Whether this is an external link that should open in a new tab */
  external?: boolean;
  /** Optional tooltip text */
  tooltip?: string;
  /** Optional badge to display next to the navigation item */
  badge?: {
    text: string;
    type?: 'info' | 'tip' | 'warning' | 'danger';
  };
}

/**
 * Dropdown navigation item with enhanced icon support for child items
 * Enables rich dropdown menus with icons and visual organization
 */
export interface NavItemWithChildrenAndIcons
  extends Omit<DefaultTheme.NavItemWithChildren, 'items'> {
  /** Collection of child navigation items */
  items: (NavItemWithIcon | DefaultTheme.NavItem)[];
  /** Section dividers for organizing dropdown items */
  dividers?: Array<{
    /** Position of divider (index-based) */
    after: number;
    /** Optional label for the divider */
    label?: string;
  }>;
  /** Optional icon for the dropdown itself */
  icon?: SVGIcon;
}

/**
 * Enhanced sidebar item with additional properties
 * Provides more customization options for sidebar navigation
 */
export interface EnhancedSidebarItem extends DefaultTheme.SidebarItem {
  /** Optional icon to display next to the sidebar item */
  icon?: SVGIcon;
  /** Optional badge to highlight new or important items */
  badge?: {
    text: string;
    type?: 'info' | 'tip' | 'warning' | 'danger';
  };
  /** Optional tooltip text for providing additional context */
  tooltip?: string;
}

/**
 * Type guard to check if a navigation item has custom icons
 *
 * @param item - Navigation item to check
 * @returns Type predicate confirming the item has an icon
 */
export const hasIcon = (
  item: DefaultTheme.NavItem | NavItemWithIcon,
): item is NavItemWithIcon => {
  return 'icon' in item && item.icon !== undefined;
};

/**
 * Type guard to check if a navigation item is a dropdown
 *
 * @param item - Navigation item to check
 * @returns Type predicate confirming the item is a dropdown
 */
export const isDropdown = (
  item: DefaultTheme.NavItem | NavItemWithChildrenAndIcons,
): item is NavItemWithChildrenAndIcons | DefaultTheme.NavItemWithChildren => {
  return 'items' in item && Array.isArray(item.items);
};

/**
 * Type guard to check if a sidebar item has nested items
 *
 * @param item - Sidebar item to check
 * @returns Type predicate confirming the item has nested items
 */
export const hasSidebarItems = (
  item: DefaultTheme.SidebarItem,
): item is DefaultTheme.SidebarItem & { items: DefaultTheme.SidebarItem[] } => {
  return 'items' in item && Array.isArray(item.items);
};

/**
 * Main navigation items organized by section
 */
const navigationItems = {
  /**
   * Primary documentation navigation
   */
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

  /**
   * External resources and community links
   */
  resources: [
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
  ],
};

/**
 * Complete main navigation configuration
 * Combines all navigation sections into the final structure
 */
export const nav: (DefaultTheme.NavItem | NavItemWithChildrenAndIcons)[] = [
  ...navigationItems.main,
  ...navigationItems.resources,
];

/**
 * Guide section sidebar items with organization by topic
 */
const guideSidebar: DefaultTheme.SidebarItem[] = [
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
];

/**
 * Reference section sidebar items with API documentation
 */
const referenceSidebar: DefaultTheme.SidebarItem[] = [
  {
    text: '📖 API Reference',
    collapsed: false,
    items: [
      { text: 'API Overview', link: '/reference/api-reference' },
      { text: 'Configuration Options', link: '/reference/configuration' },
    ],
  },
];

/**
 * Comprehensive sidebar configuration with path-based navigation
 * Different sidebar content displays based on the current section
 */
export const sidebar: DefaultTheme.Sidebar = {
  '/guide/': guideSidebar,
  '/reference/': referenceSidebar,
};

/**
 * Edit link configuration for GitHub contributions
 * Enables users to easily propose edits to documentation pages
 */
export const editLink: DefaultTheme.EditLink = {
  pattern:
    'https://github.com/tashfiqul-islam/profile-weather-view/edit/main/docs/:path',
  text: 'Edit this page on GitHub',
};

/**
 * Navigation labels for previous/next page links
 * Controls the text displayed in pagination controls
 */
export const docFooter: DefaultTheme.DocFooter = {
  prev: 'Previous page',
  next: 'Next page',
};

/**
 * Create sidebar configuration with intelligent defaults
 *
 * @param options - Customization options for sidebar behavior
 * @returns Configured sidebar object ready for VitePress
 */
export const createSidebar = (options?: {
  /** Whether guide sections should be collapsed by default */
  collapseGuide?: boolean;
  /** Whether reference sections should be collapsed by default */
  collapseReference?: boolean;
  /** Additional custom sidebar sections by path */
  additionalSections?: Record<string, DefaultTheme.SidebarItem[]>;
}): DefaultTheme.Sidebar => {
  // Create a deep copy of the sidebar configuration to avoid mutations
  const customSidebar: DefaultTheme.Sidebar = {
    '/guide/': JSON.parse(JSON.stringify(guideSidebar)),
    '/reference/': JSON.parse(JSON.stringify(referenceSidebar)),
  };

  // Apply collapsible options to guide sections if specified
  if (options?.collapseGuide) {
    (customSidebar['/guide/'] as DefaultTheme.SidebarItem[]).forEach((item) => {
      if ('collapsed' in item) {
        item.collapsed = true;
      }
    });
  }

  // Apply collapsible options to reference sections if specified
  if (options?.collapseReference) {
    (customSidebar['/reference/'] as DefaultTheme.SidebarItem[]).forEach(
      (item) => {
        if ('collapsed' in item) {
          item.collapsed = true;
        }
      },
    );
  }

  // Merge additional sections if provided
  if (options?.additionalSections) {
    Object.entries(options.additionalSections).forEach(([path, items]) => {
      customSidebar[path] = items;
    });
  }

  return customSidebar;
};

/**
 * Utility function to generate a navigation item with badge
 *
 * @param text - Display text for the item
 * @param link - URL the item links to
 * @param badgeText - Text to display in the badge
 * @param badgeType - Visual style for the badge
 * @returns Configured navigation item with badge
 */
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
