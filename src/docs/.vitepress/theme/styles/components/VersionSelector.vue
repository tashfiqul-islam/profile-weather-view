<script setup lang="ts">
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue';
import { useRoute, useRouter, useData } from 'vitepress';
import {
  VERSION_STATE,
  extractVersionFromPath,
  getVersionsNavData,
  formatVersion,
  stripVersionFromPath,
  getVersionPath,
} from '../../../version';
import type { VersionNavItem } from '../../../version';

const DROPDOWN_CONFIG = {
  ID: 'version-dropdown',
  LISTBOX_ID: 'version-listbox',
  MAX_VISIBLE_ITEMS: 5,
} as const;

// Reactive state
const isOpen = ref(false);
const currentVersion = ref('');
const focusedIndex = ref(-1);

// Vue Router and Route context
const route = useRoute();
const router = useRouter();
const { site } = useData();

// Computed properties
const versions = computed<VersionNavItem[]>(() => getVersionsNavData());

const currentVersionDisplay = computed(() => {
  const version = currentVersion.value;
  return formatVersion(version);
});

// Methods
const detectCurrentVersion = (): string => {
  const extracted = extractVersionFromPath(route.path) || VERSION_STATE.LATEST;
  currentVersion.value = extracted;
  return extracted;
};

const selectVersion = (version: string, event?: Event) => {
  event?.preventDefault();
  event?.stopPropagation();

  if (version === currentVersion.value) {
    isOpen.value = false;
    return;
  }

  const contentPath = stripVersionFromPath(route.path);
  const newPath = getVersionPath(version, contentPath);
  router.go(newPath);
  isOpen.value = false;
  focusedIndex.value = -1;
};

const toggleDropdown = (event?: Event) => {
  event?.preventDefault();
  isOpen.value = !isOpen.value;

  if (isOpen.value) {
    focusedIndex.value = versions.value.findIndex(
      (v) => v.version === currentVersion.value,
    );
  }
};

const handleKeyDown = (event: KeyboardEvent) => {
  if (!isOpen.value) return;

  const itemCount = versions.value.length;

  switch (event.key) {
    case 'Escape':
      isOpen.value = false;
      break;
    case 'ArrowDown':
      event.preventDefault();
      focusedIndex.value = (focusedIndex.value + 1) % itemCount;
      break;
    case 'ArrowUp':
      event.preventDefault();
      focusedIndex.value = (focusedIndex.value - 1 + itemCount) % itemCount;
      break;
    case 'Enter':
    case ' ':
      if (focusedIndex.value !== -1) {
        selectVersion(versions.value[focusedIndex.value].version, event);
      }
      break;
    case 'Home':
      event.preventDefault();
      focusedIndex.value = 0;
      break;
    case 'End':
      event.preventDefault();
      focusedIndex.value = itemCount - 1;
      break;
  }
};

const handleClickOutside = (event: MouseEvent) => {
  const dropdown = document.getElementById(DROPDOWN_CONFIG.ID);
  if (dropdown && !dropdown.contains(event.target as Node)) {
    isOpen.value = false;
  }
};

// Lifecycle hooks
onMounted(() => {
  detectCurrentVersion();
  document.addEventListener('click', handleClickOutside);
  document.addEventListener('keydown', handleKeyDown);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
  document.removeEventListener('keydown', handleKeyDown);
});

// Watch route changes
watch(() => route.path, detectCurrentVersion);
</script>

<template>
  <div
    :id="DROPDOWN_CONFIG.ID"
    class="version-selector"
    role="combobox"
    :aria-expanded="isOpen"
    :aria-haspopup="true"
  >
    <button
      class="version-button"
      type="button"
      @click="toggleDropdown"
      :aria-label="`Current version: ${currentVersionDisplay}`"
    >
      <span class="version-display">{{ currentVersionDisplay }}</span>
      <svg
        class="version-icon"
        :class="{ 'version-icon-open': isOpen }"
        viewBox="0 0 20 20"
        width="16"
        height="16"
        aria-hidden="true"
      >
        <path
          fill="currentColor"
          d="M6.5 9.5L10 13L13.5 9.5"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>

    <div
      v-if="isOpen"
      :id="DROPDOWN_CONFIG.LISTBOX_ID"
      class="version-dropdown"
      role="listbox"
    >
      <div class="version-dropdown-header">Documentation Versions</div>

      <div class="version-list">
        <div
          v-for="(item, index) in versions"
          :key="item.version"
          class="version-item"
          :class="{
            'version-selected': item.version === currentVersion,
            'version-focused': index === focusedIndex,
          }"
          role="option"
          :aria-selected="item.version === currentVersion"
          @click="selectVersion(item.version)"
          @mouseenter="focusedIndex = index"
        >
          <div class="version-item-main">
            <span class="version-number">{{
              formatVersion(item.version, { prefix: true })
            }}</span>
            <span v-if="item.isLatest" class="version-badge latest">
              Latest
            </span>
          </div>
          <div class="version-date">{{ item.date }}</div>
        </div>
      </div>

      <div class="version-dropdown-footer">
        <a
          href="https://github.com/your-repo/releases"
          target="_blank"
          rel="noopener noreferrer"
          class="version-link"
        >
          View all releases
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.version-selector {
  position: relative;
  display: inline-flex;
  align-items: center;
  height: 36px;
  margin-right: 12px;
}

.version-button {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 12px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-1);
  transition: all 0.2s ease;
  cursor: pointer;
}

.version-button:hover {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-bg-soft);
}

.version-icon {
  transition: transform 0.2s ease;
}

.version-icon-open {
  transform: rotate(180deg);
}

.version-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 6px;
  width: 240px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.version-dropdown-header {
  padding: 12px 16px;
  font-size: 12px;
  font-weight: 600;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-divider);
}

.version-list {
  max-height: calc(48px * 5);
  overflow-y: auto;
}

.version-item {
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: background 0.2s ease;
}

.version-item:hover {
  background: var(--vp-c-bg-soft);
}

.version-item-main {
  display: flex;
  align-items: center;
  gap: 8px;
}

.version-number {
  font-weight: 500;
  color: var(--vp-c-text-1);
}

.version-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.version-badge.latest {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

.version-date {
  font-size: 12px;
  color: var(--vp-c-text-2);
}

.version-dropdown-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--vp-c-divider);
}

.version-link {
  color: var(--vp-c-brand-1);
  font-size: 12px;
  text-decoration: none;
  transition: color 0.2s ease;
}

.version-link:hover {
  color: var(--vp-c-brand-2);
  text-decoration: underline;
}

.version-selected {
  background: var(--vp-c-bg-soft);
}

.version-focused {
  background: var(--vp-c-bg-soft);
  outline: none;
}

@media (max-width: 768px) {
  .version-selector {
    height: 32px;
  }

  .version-button {
    padding: 0 10px;
    font-size: 13px;
  }

  .version-dropdown {
    width: 220px;
  }

  .version-item {
    padding: 10px 12px;
  }
}
</style>
