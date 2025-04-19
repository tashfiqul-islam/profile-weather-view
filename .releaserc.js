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
          // Ensure consistent breaking change detection with analyzer
          noteKeywords: ['BREAKING CHANGE', 'BREAKING CHANGES', 'BREAKING'],
        },
        writerOpts: {
          // Organize commits for readability
          commitsSort: ['scope', 'subject'],

          // For first release only, we want to generate a single entry
          // and ignore all the individual commits
          generateOpts: {
            // Add custom first release handling
            mainTemplate: `{{> header}}

{{#if isFirstRelease}}
* Initial release of profile-weather-view
{{else}}
{{#each commitGroups}}
{{#if title}}
### {{title}}

{{/if}}
{{#each commits}}
{{> commit root=@root}}
{{/each}}

{{/if}}
{{/each}}
{{#if noteGroups}}
{{#each noteGroups}}

### {{title}}

{{#each notes}}
* {{#if commit.scope}}**{{commit.scope}}:** {{/if}}{{text}}
{{/each}}
{{/each}}
{{/if}}
`,
          },
          transform: (commit, context) => {
            // Check if this is the first release
            const isFirstRelease = !context.lastRelease.gitTag;

            // For future reference in the template
            context.isFirstRelease = isFirstRelease;

            // If first release, only keep one commit representative of the whole release
            if (isFirstRelease) {
              const mainCommit = commit.type === 'feat' && commit.scope === 'weather' &&
                commit.subject.includes('initial release');

              // Skip all other commits for first release
              if (!mainCommit) {
                return null;
              }
            }

            // Use default transformation for subsequent releases
            const defaultTransform = context.writer.transform;
            return defaultTransform(commit, context);
          }
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
     *
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
