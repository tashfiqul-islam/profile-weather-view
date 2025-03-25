/**
 * SEO configuration module for VitePress documentation
 * Provides essential SEO optimizations following 2025 best practices
 *
 * @module seo
 */

import type { SitemapStreamOptions } from 'sitemap';
import type { SitemapItem as VitePressSitemapItem } from 'sitemap';
import type { Awaitable } from 'vitepress';
import type { HeadConfig } from 'vitepress';

/**
 * VitePress-compatible sitemap configuration
 */
export interface SitemapConfig {
  /** Site hostname */
  hostname: string;
  /** Change frequency by URL pattern */
  changefreq?: Record<string, 'daily' | 'weekly' | 'monthly'>;
  /** Default change frequency */
  defaultChangefreq?: 'daily' | 'weekly' | 'monthly';
  /** URL patterns to exclude */
  exclude?: string[];
  /** URL priorities by pattern */
  priorities?: Record<string, number>;
}

/**
 * Core robots.txt configuration
 */
export interface RobotsOptions {
  /** Allow all bots */
  allowAll?: boolean;
  /** Specific crawler rules */
  rules?: Array<{
    /** User agent to target */
    userAgent: string;
    /** URLs to allow */
    allow?: string[];
    /** URLs to disallow */
    disallow?: string[];
  }>;
  /** Sitemap URL */
  sitemapUrl?: string;
  /** Host directive */
  host?: string;
}

/**
 * Structured data schema
 */
export interface StructuredData {
  /** Schema.org context */
  '@context': string;
  /** Schema.org type */
  '@type': string;
  /** Additional schema properties */
  [key: string]: any;
}

/**
 * Essential meta tag options
 */
export interface MetaOptions {
  /** Page title */
  title: string;
  /** Page description */
  description: string;
  /** Content author */
  author: string;
  /** Twitter handle */
  twitterHandle: string;
  /** Primary theme color */
  themeColor: string;
  /** Semantic keywords */
  keywords: string[];
  /** Open Graph image URL */
  ogImage: string;
  /** Base site URL */
  baseUrl: string;
  /** Canonical URL override */
  canonicalUrl?: string;
  /** Content publication date */
  publishDate?: string;
  /** Content update date */
  modifiedDate?: string;
}

/**
 * Default meta configuration
 */
const defaultMetaOptions: MetaOptions = {
  title: 'Profile Weather View',
  description: 'Automated weather updates for your GitHub profile README',
  author: 'Tashfiqul Islam',
  twitterHandle: '@tashfiqulislam',
  themeColor: '#3178C6',
  keywords: [
    'github',
    'readme',
    'profile',
    'weather',
    'bun',
    'typescript',
    'automation',
  ],
  ogImage: 'https://profile-weather-view.dev/og-image.png',
  baseUrl: 'https://profile-weather-view.dev',
};

/**
 * Default sitemap configuration
 */
const defaultSitemapConfig: SitemapConfig = {
  hostname: 'https://profile-weather-view.dev',
  defaultChangefreq: 'weekly',
};

/**
 * Generate structured data for rich search results
 *
 * @param options - Metadata options
 * @returns Structured data for rich search results
 */
export const createStructuredData = (
  options: Partial<MetaOptions> = {},
): StructuredData => {
  const mergedOptions = { ...defaultMetaOptions, ...options };

  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: mergedOptions.title,
    description: mergedOptions.description,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    author: {
      '@type': 'Person',
      name: mergedOptions.author,
    },
  };
};

/**
 * Generate head tags for VitePress configuration
 *
 * @param options - Metadata options
 * @returns Head tags array for VitePress
 */
export const createHeadTags = (
  options: Partial<MetaOptions> = {},
): HeadConfig[] => {
  const mergedOptions = { ...defaultMetaOptions, ...options };
  const {
    title,
    description,
    author,
    twitterHandle,
    themeColor,
    keywords,
    ogImage,
    baseUrl,
    canonicalUrl,
  } = mergedOptions;

  const canonical = canonicalUrl || baseUrl;

  return [
    // Favicon and appearance
    [
      'link',
      { rel: 'icon', type: 'image/svg+xml', href: '/icons/weather-hero-2.svg' },
    ],
    [
      'link',
      { rel: 'mask-icon', href: '/icons/weather-hero-2', color: themeColor },
    ],

    // Canonical URL
    ['link', { rel: 'canonical', href: canonical }],

    // Core meta tags
    ['meta', { name: 'theme-color', content: themeColor }],
    ['meta', { name: 'author', content: author }],
    ['meta', { name: 'keywords', content: keywords.join(', ') }],

    // Open Graph tags
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:title', content: title }],
    ['meta', { name: 'og:description', content: description }],
    ['meta', { name: 'og:image', content: ogImage }],
    ['meta', { name: 'og:url', content: canonical }],

    // Twitter Card tags
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:site', content: twitterHandle }],
    ['meta', { name: 'twitter:title', content: title }],
    ['meta', { name: 'twitter:description', content: description }],
    ['meta', { name: 'twitter:image', content: ogImage }],

    // Structured data
    [
      'script',
      { type: 'application/ld+json' },
      JSON.stringify(createStructuredData(mergedOptions)),
    ],
  ];
};

/**
 * Function to assign priority to sitemap URLs based on path depth
 *
 * @param items - Sitemap items to prioritize
 * @returns Sitemap items with assigned priorities
 */
export const assignPriorityByDepth = (
  items: VitePressSitemapItem[],
): VitePressSitemapItem[] => {
  return items.map((item) => {
    // Calculate priority based on URL depth
    const segments = item.url.split('/').filter(Boolean);
    const priority = Math.max(0.1, 1 - segments.length * 0.1);

    return {
      ...item,
      priority,
    };
  });
};

/**
 * Create sitemap configuration for VitePress
 *
 * @param config - Sitemap configuration options
 * @returns Configured sitemap options
 */
export const createSitemap = (
  config: Partial<SitemapConfig> = {},
): SitemapStreamOptions & {
  hostname: string;
  transformItems?: (
    items: VitePressSitemapItem[],
  ) => Awaitable<VitePressSitemapItem[]>;
} => {
  const mergedConfig = { ...defaultSitemapConfig, ...config };
  const currentDate = new Date().toISOString();

  return {
    hostname: mergedConfig.hostname,
    transformItems: (items: VitePressSitemapItem[]) => {
      // Add lastmod to all items
      items = items.map((item) => ({ ...item, lastmod: currentDate }));
      // First apply base priority by depth
      let processedItems = assignPriorityByDepth(items);

      // Apply custom priorities if specified
      if (mergedConfig.priorities) {
        processedItems = processedItems.map((item) => {
          for (const [urlPattern, priority] of Object.entries(
            mergedConfig.priorities || {},
          )) {
            if (item.url.includes(urlPattern)) {
              return { ...item, priority };
            }
          }
          return item;
        });
      }

      // Filter excluded URLs if specified
      if (mergedConfig.exclude?.length) {
        processedItems = processedItems.filter((item) => {
          return !mergedConfig.exclude?.some((pattern) =>
            item.url.includes(pattern),
          );
        });
      }

      return processedItems;
    },
  };
};

/**
 * Default robots.txt configuration
 */
export const robots: RobotsOptions = {
  allowAll: true,
  sitemapUrl: 'https://profile-weather-view.dev/sitemap.xml',
};

/**
 * Simplified sitemap configuration for direct use in VitePress config
 */
export const sitemap = createSitemap();

/**
 * Default head configuration for VitePress
 */
export const head: HeadConfig[] = createHeadTags();
