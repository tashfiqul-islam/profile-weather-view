import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'Profile Weather View',
  description: 'Automated weather updates for your GitHub profile README',

  // Site-wide configurations
  lang: 'en-US',
  lastUpdated: true,
  cleanUrls: true,
  ignoreDeadLinks: true,

  // Meta-tags for SEO and social sharing
  head: [
    [
      'link',
      { rel: 'icon', type: 'image/svg+xml', href: '/icons/weather.svg' },
    ],
    [
      'link',
      { rel: 'mask-icon', href: '/icons/weather.svg', color: '#3178C6' },
    ],
    ['meta', { name: 'theme-color', content: '#3178C6' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:title', content: 'Profile Weather View' }],
    [
      'meta',
      {
        name: 'og:description',
        content: 'Automated weather updates for your GitHub profile README',
      },
    ],
    [
      'meta',
      {
        name: 'og:image',
        content: 'https://profile-weather-view.dev/og-image.png',
      },
    ],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:site', content: '@tashfiqulislam' }],
    ['meta', { name: 'author', content: 'Tashfiqul Islam' }],
    [
      'meta',
      {
        name: 'keywords',
        content:
          'github, readme, profile, weather, bun, typescript, automation',
      },
    ],
    // Structured data for rich search results
    [
      'script',
      { type: 'application/ld+json' },
      JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Profile Weather View',
        description: 'Automated weather updates for your GitHub profile README',
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Any',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        author: {
          '@type': 'Person',
          name: 'Tashfiqul Islam',
        },
      }),
    ],
  ],

  // Theme configuration
  themeConfig: {
    logo: {
      light: '/icons/weather.svg',
      dark: '/icons/weather.svg',
    },

    siteTitle: 'Profile Weather View',

    // Main navigation
    nav: [
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
        text: 'Advanced',
        link: '/advanced/deployment',
        activeMatch: '/advanced/',
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
            text: 'Bun Runtime',
            link: 'https://bun.sh',
            icon: {
              svg: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path fill="currentColor" d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0Zm.5 2.5h-1v3h-3v1h3v3h1v-3h3v-1h-3v-3Z"/></svg>',
            },
          },
          {
            text: 'OpenWeather API',
            link: 'https://openweathermap.org/api',
            icon: {
              svg: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path fill="currentColor" d="M7.5 0a.5.5 0 0 1 .5.5v3.55c.557-.327 1.25-.53 2-.53c2.172 0 3.928 1.757 3.928 3.929c0 1.54-.885 2.862-2.167 3.516c.312.39.515.862.588 1.372l.13.163h1.241c.103-.5.278-.934.509-1.347A4.992 4.992 0 0 0 16 8.928c0-2.76-2.24-5-5-5c-.732 0-1.428.157-2.055.44C8.723 2.862 8.074 1.398 7 .354V.5a.5.5 0 0 1-.5.5a.5.5 0 0 1-.5-.5A.5.5 0 0 1 7.5 0Zm-.352 6.024c-.616.26-1.145.688-1.527 1.23a4.918 4.918 0 0 0-1.98-.413a4.934 4.934 0 0 0-2.505.682A3.933 3.933 0 0 1 4 3.928c0-2.172 1.757-3.93 3.929-3.93c.517 0 1.011.1 1.461.282c.555.73.874 1.703.874 2.674c0 1.245-.466 2.405-1.267 3.303a3.928 3.928 0 0 0-.849-.233Z"/></svg>',
            },
          },
          {
            text: 'TypeScript',
            link: 'https://www.typescriptlang.org/',
            icon: {
              svg: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path fill="currentColor" d="M3 6.25h10.5V9H9.83v6.75H6.67V9H3V6.25Zm8.26-3a.74.74 0 0 1 .36.63c0 .27-.13.5-.36.64c-.23.13-.5.16-.85.16h-.25c-.37 0-.66-.03-.9-.16a.72.72 0 0 1-.34-.64c0-.28.1-.5.34-.63c.24-.12.53-.17.9-.17h.25c.36 0 .63.05.85.17Z"/></svg>',
            },
          },
        ],
      },
    ],

    // Sidebar configuration with collapsible sections
    sidebar: {
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
      '/advanced/': [
        {
          text: '⚙️ Advanced Topics',
          collapsed: false,
          items: [
            { text: 'CI/CD Deployment', link: '/advanced/deployment' },
            { text: 'Comprehensive Testing', link: '/advanced/testing' },
            { text: 'Contributing Guide', link: '/advanced/contributing' },
            { text: 'Troubleshooting', link: '/advanced/troubleshooting' },
          ],
        },
      ],
    },

    // Edit page on GitHub
    editLink: {
      pattern:
        'https://github.com/tashfiqul-islam/profile-weather-view/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },

    // Social links
    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/tashfiqul-islam',
      },
      {
        icon: {
          svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M10.18 16.3h-3.5v-8.7h3.5V16.3Zm3.5-13.5c1.2 0 2.25.43 3.1 1.28A4.25 4.25 0 0 1 18.07 7v9.7c0 1.15-.4 2.13-1.2 2.93s-1.77 1.2-2.92 1.2H5.18c-1.15 0-2.12-.4-2.92-1.2s-1.2-1.78-1.2-2.93V7c0-1.15.4-2.13 1.2-2.93S4.03 2.88 5.18 2.88l8.5-.07Zm0 2.63h-8.5c-.45 0-.83.16-1.13.47c-.3.3-.46.67-.46 1.1v9.7c0 .42.16.8.47 1.1c.3.32.67.47 1.12.47h8.5c.45 0 .83-.16 1.13-.46c.3-.3.46-.67.46-1.1V7c0-.43-.16-.8-.47-1.1c-.3-.32-.67-.47-1.12-.47ZM21.3 7.8c.3.3.44.67.44 1.13v4.73c0 .46-.15.84-.44 1.14c-.3.3-.67.44-1.13.44h-1.82v-8.7h1.82c.46 0 .84.15 1.13.44v.82Z"/></svg>',
        },
        link: 'https://www.linkedin.com/in/tashfiqulislam/',
      },
      {
        icon: {
          svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2c2.717 0 3.056.01 4.122.06c1.065.05 1.79.217 2.428.465c.66.254 1.216.598 1.772 1.153a4.908 4.908 0 0 1 1.153 1.772c.247.637.415 1.363.465 2.428c.047 1.066.06 1.405.06 4.122c0 2.717-.01 3.056-.06 4.122c-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772a4.915 4.915 0 0 1-1.772 1.153c-.637.247-1.363.415-2.428.465c-1.066.047-1.405.06-4.122.06c-2.717 0-3.056-.01-4.122-.06c-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153a4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122c.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 1.802c-2.67 0-2.986.01-4.04.059c-.976.045-1.505.207-1.858.344c-.466.182-.8.398-1.15.748c-.35.35-.566.684-.748 1.15c-.137.353-.3.882-.344 1.857c-.048 1.055-.058 1.37-.058 4.04c0 2.67.01 2.986.058 4.04c.045.976.207 1.505.344 1.858c.182.466.399.8.748 1.15c.35.35.684.566 1.15.748c.353.137.882.3 1.857.344c1.054.048 1.37.058 4.04.058c2.67 0 2.986-.01 4.04-.058c.976-.045 1.505-.207 1.858-.344c.466-.182.8-.398 1.15-.748c.35-.35.566-.684.748-1.15c.137-.353.3-.882.344-1.857c.048-1.055.058-1.37.058-4.04c0-2.67-.01-2.986-.058-4.04c-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 0 0-.748-1.15a3.098 3.098 0 0 0-1.15-.748c-.353-.137-.882-.3-1.857-.344c-1.055-.048-1.37-.058-4.04-.058zm0 3.063a5.135 5.135 0 1 1 0 10.27a5.135 5.135 0 0 1 0-10.27zm0 8.468a3.333 3.333 0 1 0 0-6.666a3.333 3.333 0 0 0 0 6.666zm6.538-8.671a1.2 1.2 0 1 1-2.4 0a1.2 1.2 0 0 1 2.4 0z"/></svg>',
        },
        link: 'https://www.instagram.com/_tashfiqulislam/',
      },
      {
        icon: {
          svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm13 2h-2.5A3.5 3.5 0 0 0 12 8.5V11h-2v3h2v7h3v-7h3v-3h-3V9a1 1 0 0 1 1-1h2V5z"/></svg>',
        },
        link: 'https://www.facebook.com/Tashfiq95',
      },
    ],

    // Footer configuration
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025 Tashfiqul Islam',
    },

    // Search configuration
    search: {
      provider: 'local',
      options: {
        detailedView: true,
        translations: {
          button: {
            buttonText: 'Search Documentation',
          },
          modal: {
            noResultsText: 'No results for',
            resetButtonTitle: 'Clear search query',
            footer: {
              selectText: 'to select',
              navigateText: 'to navigate',
              closeText: 'to close',
            },
          },
        },
      },
    },

    // Dark mode configuration
    appearance: {
      preference: 'auto',
      darkModeSwitchLabel: 'Theme',
    },

    // Outline configuration
    outline: {
      level: [2, 3],
      label: 'On this page',
    },

    // Page navigation
    docFooter: {
      prev: 'Previous page',
      next: 'Next page',
    },

    // Last updated timestamp
    lastUpdated: {
      text: 'Updated at',
      formatOptions: {
        dateStyle: 'full',
        timeStyle: 'medium',
      },
    },

    // Carbon Ads (optional revenue source)
    carbonAds: {
      code: '', // Add Carbon Ads code here
      placement: '',
    },

    // Accessibility labels
    langMenuLabel: 'Change language',
    returnToTopLabel: 'Back to top',
    sidebarMenuLabel: 'Menu',

    // External links behavior
    externalLinkIcon: true,
  },

  // Markdown configuration
  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark',
    },
    lineNumbers: true,
    toc: { level: [2, 3] },
  },

  // Build optimization
  buildEnd: async (siteConfig) => {
    // Can add custom build logic here
    console.log('VitePress site build complete!');
  },

  // Internationalization
  locales: {
    root: {
      label: 'English',
      lang: 'en-US',
    },
  },

  // Sitemap generation for SEO
  sitemap: {
    hostname: 'https://profile-weather-view.dev',
    lastmodDateOnly: false,
    transformItems: (items) => {
      // Custom sitemap item transformations
      return items.map((item) => {
        // Add priority based on URL depth
        const segments = item.url.split('/').filter(Boolean);
        item.priority = Math.max(0.1, 1 - segments.length * 0.1);
        return item;
      });
    },
  },

  // Vue options (for advanced customization)
  vue: {
    template: {
      compilerOptions: {
        isCustomElement: (tag) => tag === 'custom-element',
      },
    },
  },
});
