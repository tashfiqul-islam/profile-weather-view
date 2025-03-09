/**
 * search.ts
 * Contains configuration for the search functionality
 */

import type { DefaultTheme } from 'vitepress';

/**
 * Type for search providers supported by VitePress
 */
export type SearchProvider = 'local' | 'algolia';

/**
 * Interface for search button translations
 */
export interface SearchButtonTranslations {
  buttonText: string;
  buttonAriaLabel?: string;
}

/**
 * Interface for search modal translations
 */
export interface SearchModalTranslations {
  resetButtonTitle?: string;
  backButtonTitle?: string;
  noResultsText?: string;
  footer?: {
    selectText?: string;
    navigateText?: string;
    closeText?: string;
  };
}

/**
 * Interface for search translations
 */
export interface SearchTranslations {
  button: SearchButtonTranslations;
  modal: SearchModalTranslations;
}

/**
 * Interface for local search options
 */
export interface LocalSearchOptions {
  /**
   * Show detailed search results view
   */
  detailedView: boolean;

  /**
   * Custom translations for search UI
   */
  translations?: SearchTranslations;

  /**
   * Maximum number of results to display
   */
  maxSuggestions?: number;

  /**
   * Custom search logic or filters
   */
  filter?: (page: any, query: string) => boolean;

  /**
   * Custom result view
   */
  getItemValue?: (item: any) => string;
}

/**
 * Interface for Algolia DocSearch options
 */
export interface AlgoliaSearchOptions {
  appId: string;
  apiKey: string;
  indexName: string;
  placeholder?: string;
  translations?: SearchTranslations;
}

/**
 * Default local search translations
 */
export const defaultSearchTranslations: SearchTranslations = {
  button: {
    buttonText: 'Search Documentation',
    buttonAriaLabel: 'Search documentation',
  },
  modal: {
    noResultsText: 'No results for',
    resetButtonTitle: 'Clear search query',
    backButtonTitle: 'Close search',
    footer: {
      selectText: 'to select',
      navigateText: 'to navigate',
      closeText: 'to close',
    },
  },
};

/**
 * Local search configuration
 */
export const localSearchOptions: LocalSearchOptions = {
  detailedView: true,
  translations: defaultSearchTranslations,
  maxSuggestions: 10,
};

/**
 * Create a search configuration for local search
 * @param options - Optional overrides for local search
 * @returns Search configuration for VitePress
 */
export const createLocalSearch = (
  options?: Partial<LocalSearchOptions>,
): DefaultTheme.Config['search'] => {
  return {
    provider: 'local',
    options: {
      ...localSearchOptions,
      ...options,
    },
  };
};

/**
 * Create a search configuration for Algolia search
 * @param options - Required Algolia configuration
 * @returns Search configuration for VitePress
 */
export const createAlgoliaSearch = (
  options: AlgoliaSearchOptions,
): DefaultTheme.Config['search'] => {
  return {
    provider: 'algolia',
    options: {
      ...options,
    },
  };
};

/**
 * Default search configuration using local search
 * For direct import into config
 */
export const search = createLocalSearch();
