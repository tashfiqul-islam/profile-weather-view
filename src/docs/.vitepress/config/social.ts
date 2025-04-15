/**
 * social.ts
 * Contains social media links configuration with enhanced SVG icons
 */

import type { DefaultTheme } from 'vitepress';

/**
 * Interface for SVG icon configuration
 */
export interface SVGIcon {
  svg: string;
}

/**
 * Enhanced social link type with SVG icon support and accessibility
 */
export interface EnhancedSocialLink
  extends Omit<DefaultTheme.SocialLink, 'icon'> {
  icon: {
    svg: string;
  };
  ariaLabel: string;
}

/**
 * GitHub icon with modern styling
 */
const githubIcon: SVGIcon = {
  svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" class="icon"><path fill="currentColor" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z"/></svg>',
};

/**
 * LinkedIn icon with modern styling
 */
const linkedinIcon: SVGIcon = {
  svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" class="icon"><path fill="currentColor" d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77Z"/></svg>',
};

/**
 * Instagram icon with modern styling
 */
const instagramIcon: SVGIcon = {
  svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" class="icon"><path fill="currentColor" d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8A1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5a5 5 0 0 1-5 5a5 5 0 0 1-5-5a5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3Z"/></svg>',
};

/**
 * Facebook icon with modern styling
 */
const facebookIcon: SVGIcon = {
  svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" class="icon"><path fill="currentColor" d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5Z"/></svg>',
};

/**
 * The CSS styles needed for the social icons
 * Should be imported in the theme's custom CSS file
 */
export const socialIconsCss = `
/* Social icon styles for light/dark mode support */
:root {
  --icon-color: #2c3e50;
}

.dark {
  --icon-color: #ffffff;
}

.icon {
  color: var(--icon-color);
  transition: color 0.2s ease, transform 0.2s ease;
}

.icon:hover {
  color: var(--vp-c-brand);
  transform: scale(1.1);
}
`;

/**
 * Social link configuration with enhanced icons for all platforms
 */
export const socialLinks: EnhancedSocialLink[] = [
  {
    icon: githubIcon,
    link: 'https://github.com/tashfiqul-islam',
    ariaLabel: 'GitHub Profile',
  },
  {
    icon: linkedinIcon,
    link: 'https://www.linkedin.com/in/tashfiqulislam/',
    ariaLabel: 'LinkedIn Profile',
  },
  {
    icon: instagramIcon,
    link: 'https://www.instagram.com/_tashfiqulislam/',
    ariaLabel: 'Instagram Profile',
  },
  {
    icon: facebookIcon,
    link: 'https://www.facebook.com/Tashfiq95',
    ariaLabel: 'Facebook Profile',
  },
];

/**
 * Create social links for different site configurations
 * @param customLinks - Optional additional social links to include
 * @returns Array of configured social links
 */
export const createSocialLinks = (
  customLinks: EnhancedSocialLink[] = [],
): EnhancedSocialLink[] => {
  return [...socialLinks, ...customLinks];
};

/**
 * Default export for direct import into config
 */
export default socialLinks;
