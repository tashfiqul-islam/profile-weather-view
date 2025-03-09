/**
 * meta.ts
 * Contains all meta tags, SEO configurations, and document head elements
 */

import type { HeadConfig } from 'vitepress';

export interface StructuredData {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

export interface MetaOptions {
  title: string;
  description: string;
  author: string;
  twitterHandle: string;
  themeColor: string;
  keywords: string[];
  ogImage: string;
  baseUrl: string;
}

/**
 * Default meta configuration options
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
 * Generate structured data for rich search results
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
  } = mergedOptions;

  return [
    // Favicon and icon configuration
    [
      'link',
      { rel: 'icon', type: 'image/svg+xml', href: '/icons/weather.svg' },
    ],
    [
      'link',
      { rel: 'mask-icon', href: '/icons/weather.svg', color: themeColor },
    ],
    ['link', { rel: 'canonical', href: baseUrl }],

    // Primary meta tags
    ['meta', { name: 'theme-color', content: themeColor }],
    ['meta', { name: 'author', content: author }],
    ['meta', { name: 'keywords', content: keywords.join(', ') }],

    // Open Graph / Facebook
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:title', content: title }],
    ['meta', { name: 'og:description', content: description }],
    ['meta', { name: 'og:image', content: ogImage }],
    ['meta', { name: 'og:url', content: baseUrl }],

    // Twitter
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:site', content: twitterHandle }],
    ['meta', { name: 'twitter:title', content: title }],
    ['meta', { name: 'twitter:description', content: description }],
    ['meta', { name: 'twitter:image', content: ogImage }],

    // Structured data
    [
      'script',
      { type: 'application/ld+json' },
      JSON.stringify(createStructuredData(options)),
    ],
  ];
};

/**
 * Default head configuration for VitePress
 * Can be imported directly into the main config
 */
export const head: HeadConfig[] = createHeadTags();
