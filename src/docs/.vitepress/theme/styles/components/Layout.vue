<script setup lang="ts">
import { computed, provide, onMounted, watch } from 'vue';
import { useData, useRoute, useRouter } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import VersionSelector from './VersionSelector.vue';
import {
  extractVersionFromPath,
  getAlternateVersionPaths,
  isVersionedPath,
  getCanonicalPath,
  stripVersionFromPath,
  VERSION_STATE,
  VERSION_CONFIG,
} from '../../../version';

const { Layout } = DefaultTheme;
const { frontmatter, page, theme } = useData();
const route = useRoute();
const router = useRouter();

// Extract current version from path
const currentVersion = computed(
  () => extractVersionFromPath(route.path) || VERSION_STATE.LATEST,
);

// Get alternate version paths for current page
const alternateVersions = computed(() => getAlternateVersionPaths(route.path));

// Get canonical path for SEO
const canonicalPath = computed(() => getCanonicalPath(route.path));

// Content path without version prefix
const contentPath = computed(() => stripVersionFromPath(route.path));

// Make version information available to all components
provide('currentVersion', currentVersion);
provide('alternateVersions', alternateVersions);
provide('canonicalPath', canonicalPath);
provide('contentPath', contentPath);
provide('LATEST_VERSION', VERSION_STATE.LATEST);

/**
 * Versioned navigation handling
 * Controls redirects and error handling for versioned content
 */
onMounted(() => {
  // Check if we need to redirect to latest version
  // Only redirect if we're at the root path and not in a versioned path already
  const isRootPath = route.path === '/' || route.path === '/index.html';
  const isAlreadyVersioned = isVersionedPath(route.path);

  if (
    isRootPath &&
    !isAlreadyVersioned &&
    frontmatter.value.redirectToLatest !== false
  ) {
    router.go(VERSION_CONFIG.ROUTES.latest);
  }
});

// Watch for 404s and handle fallbacks to content without version prefix
watch(
  () => page.value.isNotFound,
  (isNotFound) => {
    if (isNotFound && isVersionedPath(route.path)) {
      // For versioned paths that 404, try the same content without version prefix
      const unversionedPath = stripVersionFromPath(route.path);
      if (unversionedPath !== route.path) {
        console.log(
          `Page not found at versioned path, trying: ${unversionedPath}`,
        );
        router.go(unversionedPath);
      } else if (currentVersion.value !== VERSION_STATE.LATEST) {
        // If that doesn't work, try the latest version
        const latestVersionPath = alternateVersions.value[VERSION_STATE.LATEST];
        if (latestVersionPath) {
          console.log(`Fallback to latest version: ${latestVersionPath}`);
          router.go(latestVersionPath);
        }
      }
    }
  },
  { immediate: true },
);
</script>

<template>
  <Layout>
    <template #nav-bar-title-before>
      <VersionSelector />
    </template>

    <template #doc-before>
      <div v-if="page.isNotFound" class="version-not-found">
        <p class="version-not-found-message">
          Page not found in current version.
          <a
            :href="alternateVersions[VERSION_STATE.LATEST]"
            class="version-not-found-link"
          >
            Try latest version
          </a>
        </p>
      </div>

      <div
        v-else-if="
          currentVersion !== VERSION_STATE.LATEST &&
          alternateVersions[VERSION_STATE.LATEST]
        "
        class="version-alert"
      >
        <p>
          You're viewing documentation for {{ currentVersion }}.
          <a
            :href="alternateVersions[VERSION_STATE.LATEST]"
            class="version-alert-link"
          >
            Switch to latest version
          </a>
        </p>
      </div>
    </template>
  </Layout>
</template>

<style>
.version-alert {
  margin: 0 24px 24px;
  padding: 12px 16px;
  border-radius: 8px;
  background: var(--vp-c-warning-soft);
  border: 1px solid var(--vp-c-warning-1);
  color: var(--vp-c-text-1);
  font-size: 14px;
  line-height: 1.6;
  display: flex;
  align-items: center;
  gap: 8px;
}

.version-alert-link {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  margin-left: 4px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.025em;
  text-transform: uppercase;
  text-decoration: none;
  transition: all 0.2s ease;
}

.version-alert-link:hover {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-2);
}

.version-not-found {
  margin: 0 24px 24px;
  padding: 12px 16px;
  border-radius: 8px;
  background: var(--vp-c-danger-soft);
  border: 1px solid var(--vp-c-danger-1);
  color: var(--vp-c-text-1);
  font-size: 14px;
  line-height: 1.6;
}

.version-not-found-message {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.version-not-found-link {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  margin-left: 4px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.025em;
  text-transform: uppercase;
  text-decoration: none;
  transition: all 0.2s ease;
}

.version-not-found-link:hover {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-2);
}
</style>
