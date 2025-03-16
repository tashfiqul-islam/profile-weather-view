/* src/docs/.vitepress/config/seo.ts */

import type { SitemapStreamOptions } from 'vitepress';
import type { SitemapItem as VitePressSitemapItem } from 'vitepress';
import type { Awaitable } from 'vitepress';

/**
 * VitePress-compatible sitemap configuration
 * Only including properties that are directly supported by VitePress
 */
export interface SitemapConfig {
  hostname: string;
}

/**
 * Default sitemap configuration
 */
export const defaultSitemapConfig: SitemapConfig = {
  hostname: 'https://profile-weather-view.dev',
};

/**
 * Function to assign priority based on URL depth
 * Home page gets the highest priority, deeper pages get lower priority
 * This function matches exactly what VitePress expects
 */
export const assignPriorityByDepth = (
  items: VitePressSitemapItem[],
): VitePressSitemapItem[] => {
  return items.map((item) => {
    // Add priority based on URL depth
    const segments = item.url.split('/').filter(Boolean);
    const priority = Math.max(0.1, 1 - segments.length * 0.1);

    return {
      ...item,
      priority,
    };
  });
};

/**
 * Simplified sitemap configuration for direct use in VitePress config
 */
export const sitemap: SitemapStreamOptions & {
  hostname: string;
  transformItems?: (
    items: VitePressSitemapItem[],
  ) => Awaitable<VitePressSitemapItem[]>;
} = {
  hostname: defaultSitemapConfig.hostname,
  transformItems: assignPriorityByDepth,
};

/**
 * Robots.txt configuration options
 */
export interface RobotsOptions {
  allowAll?: boolean;
  rules?: Array<{
    userAgent: string;
    allow?: string[];
    disallow?: string[];
  }>;
  sitemapUrl?: string;
}

/**
 * Default robots.txt configuration
 */
export const robots: RobotsOptions = {
  allowAll: true,
  sitemapUrl: 'https://profile-weather-view.dev/sitemap.xml',
};
