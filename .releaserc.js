/**
 * @file Semantic Release Configuration
 * @description Advanced configuration for semantic-release automation pipeline
 *
 * This configuration defines the entire release pipeline for profile-weather-view:
 * - Versioning strategy based on conventional commits
 * - Release note generation with customized templates
 * - Special handling for initial releases
 * - CHANGELOG.md generation and formatting
 * - GitHub release creation with customized templates
 *
 * @version 1.1.0
 * @license MIT
 */

/**
 * @typedef {import('semantic-release').GlobalConfig} SemanticReleaseConfig
 */

/** @type {SemanticReleaseConfig} */
export default {
  /**
   * Release branches configuration
   * Only commits to these branches will trigger a release
   *
   */
  branches: ['master'],

  /**
   * Release plugins configuration
   * Each plugin is responsible for a specific task in the release process
   * They execute in sequence, creating a complete release pipeline
   */
  plugins: [
    /**
     * Step 1: Analyze commits to determine release type
     * Uses conventional commits to determine version bump (major/minor/patch)
     *
     */
    [
      '@semantic-release/commit-analyzer',
      {
        preset: 'angular', // Using Angular commit convention
        releaseRules: [
          // Standard release rules
          { type: 'feat', release: 'minor' }, // New features trigger minor release
          { type: 'fix', release: 'patch' }, // Bug fixes trigger patch release

          // Additional release rules for non-standard commit types
          { type: 'docs', release: 'patch' }, // Documentation updates
          { type: 'style', release: 'patch' }, // Formatting/style changes
          { type: 'refactor', release: 'patch' }, // Code refactoring
          { type: 'perf', release: 'patch' }, // Performance improvements
          { type: 'build', release: 'patch' }, // Build system changes
          { type: 'ci', release: 'patch' }, // CI configuration changes
          { type: 'test', release: 'patch' }, // Test additions/changes
          { type: 'chore', release: 'patch' }, // Maintenance tasks
          { type: 'security', release: 'patch' }, // Security improvements
        ],
        parserOpts: {
          // Keywords in commit body that indicate breaking changes
          noteKeywords: ['BREAKING CHANGE', 'BREAKING CHANGES', 'BREAKING'],
        },
      },
    ],

    /**
     * Step 2: Generate release notes from commits
     * Creates structured, readable release notes from commit messages
     *
     */
    [
      '@semantic-release/release-notes-generator',
      {
        preset: 'angular',
        parserOpts: {
          noteKeywords: ['BREAKING CHANGE', 'BREAKING CHANGES', 'BREAKING'],
        },
        writerOpts: {
          transform: (commit, context) => {
            // Check if first release
            const isFirstRelease = !context?.lastRelease?.gitTag;

            // For first release, completely override with custom format
            if (isFirstRelease && context) {
              context.isFirstRelease = true;

              // Make the version available to the template
              if (context.nextRelease && context.nextRelease.version) {
                context.version = context.nextRelease.version;
              }

              return null; // Skip all normal commit processing
            }

            // For subsequent releases, properly format commit information
            if (typeof commit.hash === 'string') {
              commit.shortHash = commit.hash.substring(0, 7);
            }

            if (typeof commit.subject === 'string') {
              commit.subject = commit.subject.trim();
            }

            // Add proper URL links
            if (context.repository) {
              if (commit.hash) {
                const url = `${context.host}/${context.owner}/${context.repository}/commit/${commit.hash}`;
                commit.commitUrl = url;
              }
            }

            return commit;
          },

          // Main template with conditional for first release
          mainTemplate: `{{> header}}

{{#if isFirstRelease}}
## Feat

- Initial release of Profile Weather View - v{{version}}

## ✨ Key Features

- 🌐 **Real-time Data**: OpenWeather API 3.0 integration with global coverage
- 🔄 **Auto-Updates**: Updates every 8 hours via GitHub Actions
- 🛠️ **Type Safety**: 100% TypeScript + Zod schema validation
- ⚡ **High Performance**: Powered by Bun for ultra-fast execution
- 🎨 **Customizable**: Multiple display formats and themes
- 🧪 **Reliability**: 100% test coverage with comprehensive testing
{{else}}
{{#each commitGroups}}
{{#if title}}
### {{title}}

{{#each commits}}
{{> commit root=@root}}
{{/each}}

{{/if}}
{{/each}}
{{/if}}

{{> footer}}`,

          // Clean commit format template for subsequent releases
          commitPartial: `{{#if @root.isFirstRelease}}
{{else}}
* {{#if scope}}**{{scope}}:** {{/if}}{{subject}} {{#if @root.linkReferences}}([{{shortHash}}]({{commitUrl}})){{else}}({{shortHash}}){{/if}}{{#if references}}{{#each references}}, closes {{#if this.owner}}{{this.owner}}/{{/if}}{{this.repository}}#{{this.issue}}{{/each}}{{/if}}
{{/if}}`,

          // Custom footer
          footerPartial: `{{#if noteGroups}}
{{#each noteGroups}}

### {{title}}

{{#each notes}}
* {{#if commit.scope}}**{{commit.scope}}:** {{/if}}{{text}}
{{/each}}
{{/each}}
{{/if}}`,
        },
      },
    ],

    /**
     * Step 3: Create/update CHANGELOG.md file
     * Maintains a comprehensive history of changes in the project
     *
     */
    [
      '@semantic-release/changelog',
      {
        changelogFile: 'CHANGELOG.md',
        changelogTitle:
          '# Changelog\n\nAll notable changes to profile-weather-view will be documented in this file.',
      },
    ],

    /**
     * Step 4: Update version in package.json
     * Updates version field without publishing to npm
     *
     */
    [
      '@semantic-release/npm',
      {
        npmPublish: false, // Skip publishing to npm registry
      },
    ],

    /**
     * Step 5: Create GitHub release
     * Creates a tagged release on GitHub with generated notes
     * Use PAT environment variable and allow dry-run mode
     */
    [
      '@semantic-release/github',
      {
        assets: [], // No additional assets to upload with this release

        // Custom PR comment templates
        successComment:
          '🚀 This PR is included in version ${nextRelease.version}',
        failComment: '❌ Release automation failed',

        // Custom release name format
        releaseNameTemplate: 'v${nextRelease.version}',
        // Use standard generated notes for the release body

        // Skip GitHub token verification in dry-run mode
        verifyConditions: process.env.DRY_RUN === 'true' ? false : undefined,

        // Use GH_TOKEN for GitHub authentication
        githubToken: process.env.GH_TOKEN,
      },
    ],

    /**
     * Step 6: Commit updated files back to repository
     * Ensures version changes in files are committed to the repo
     *
     */
    [
      '@semantic-release/git',
      {
        // Files to commit back to the repository after version bump
        assets: [
          'CHANGELOG.md', // Updated changelog with new release
          'package.json', // Updated version number
          'bunfig.toml', // Bun-specific configuration
        ],

        // Use a concise commit message that passes commitlint
        message:
          'chore(release): ${nextRelease.version} [skip ci]\n\nRelease notes generated by semantic-release.',
      },
    ],
  ],
};
