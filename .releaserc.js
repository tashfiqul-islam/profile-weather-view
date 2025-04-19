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
     */
    [
      '@semantic-release/release-notes-generator',
      {
        preset: 'angular',
        parserOpts: {
          // Ensure consistent breaking change detection with analyzer
          noteKeywords: ['BREAKING CHANGE', 'BREAKING CHANGES', 'BREAKING'],
        },
        writerOpts: {
          // Organize commits for readability
          commitsSort: ['scope', 'subject'],
          groupBy: 'scope',
          commitGroupsSort: 'title',

          // Custom Handlebars template for release notes
          mainTemplate: `{{> header}}

{{#if noteGroups}}
{{#each noteGroups}}
### {{title}}

{{#each notes}}
* {{#if commit.scope}}**{{commit.scope}}:** {{/if}}{{text}}
{{/each}}
{{/each}}
{{/if}}

{{#if commitsWithoutNotes}}
{{#if @root.linkReferences}}
### Features and Improvements

{{#each commitsGroupedByScope}}
{{#if scope}}
#### {{scope}}

{{/if}}
{{#each commits}}
{{#if firstRelease}}
{{#if ../scope}}
* {{subject}}{{else}}
* **{{scope}}:** {{subject}}{{/if}}
{{else}}
* {{#if breaking}}💥 {{/if}}{{#if ../scope}}{{else}}**{{scope}}:** {{/if}}{{subject}} {{#if @root.linkReferences}}([{{shortHash}}]({{commitUrlFormat}})){{/if}}
{{/if}}
{{/each}}

{{/each}}
{{else}}
### Features and Improvements

{{#each commitsWithoutNotes}}
{{#if firstRelease}}
* {{subject}}{{else}}
* {{#if breaking}}💥 {{/if}}{{subject}}
{{/if}}
{{/each}}
{{/if}}
{{/if}}

{{> footer}}`,

          /**
           * Transform commit objects to enhance release notes
           * Special handling for initial release to consolidate previous work
           */
          transform: (commit, context) => {
            // Check if this is the first release (no previous tag)
            const isFirstRelease =
              !context.previousTag || context.previousTag === '';

            // Special handling for initial release
            if (isFirstRelease) {
              commit.firstRelease = true;

              // Only apply custom notes to feat commits with "initial release" text
              if (
                commit.type === 'feat' &&
                commit.subject.includes('initial release')
              ) {
                // Override notes with custom content for initial release
                commit.notes = [
                  {
                    title: 'Initial Release',
                    text: 'Profile Weather View v1.0.0 - A TypeScript utility that fetches real-time weather data and updates GitHub profile READMEs automatically.',
                  },
                ];

                // Add custom feature sections for the initial release
                commit.initialReleaseNotes = [
                  {
                    title: '✨ Key Features',
                    items: [
                      'Real-time Weather Data: OpenWeather API 3.0 integration with global coverage',
                      'Auto-Updates: Updates every 8 hours via GitHub Actions',
                      'Type Safety: 100% TypeScript + Zod schema validation',
                      'High Performance: Powered by Bun for ultra-fast execution',
                      'Customizable: Multiple display formats and themes',
                      'Reliability: 100% test coverage with comprehensive testing',
                    ],
                  },
                ];
              }
            }

            // Apply conventional commit parsing
            const conventionalCommitResult = context.writer.parseCommit(commit);

            if (conventionalCommitResult) {
              Object.assign(commit, conventionalCommitResult);
            }

            return commit;
          },

          // Partial template for consistent commit formatting
          commitPartial: `{{> commit }}`,
        },
      },
    ],

    /**
     * Step 3: Create/update CHANGELOG.md file
     * Maintains a comprehensive history of changes in the project
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
        releaseNameTemplate: 'v${version}',
      },
    ],

    /**
     * Step 6: Commit updated files back to repository
     * Ensures version changes in files are committed to the repo
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

        // Custom commit message for version bump
        message:
          'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
      },
    ],
  ],
};
