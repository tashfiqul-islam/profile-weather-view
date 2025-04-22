/**
 * @file Semantic Release Configuration
 * @description Advanced configuration for semantic-release automation pipeline
 *
 * This configuration defines the entire release pipeline for profile-weather-view:
 * - Versioning strategy based on conventional commits
 * - Release note generation with customized templates
 * - CHANGELOG.md generation and formatting
 * - GitHub release creation with customized templates
 *
 * @version 1.3.0
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
   * Uses the more modern extended syntax for better control
   */
  branches: [
    '+([0-9])?(.{+([0-9]),x}).x',  // Maintenance branches: 1.x, 1.2.x
    'master',                       // Main release branch
    { name: 'beta', prerelease: true },  // Beta release branch
    { name: 'alpha', prerelease: true }  // Alpha release branch
  ],

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
          { type: 'chore', scope: 'deps', release: 'patch' }, // Dependency updates
          { type: 'chore', release: false }, // Other maintenance tasks (no release)
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
            // Filter out merge commits and auto-generated release commits
            if (
              commit.message.startsWith('Merge branch') ||
              commit.message.startsWith('Merge pull request') ||
              (commit.message.startsWith('chore(release)') &&
                commit.message.includes('[skip ci]'))
            ) {
              return null; // Skip this commit entirely
            }

            // Format commit information for consistent display
            const newCommit = { ...commit };

            if (typeof commit.hash === 'string') {
              newCommit.shortHash = commit.hash.substring(0, 7);
            }

            if (typeof commit.subject === 'string') {
              newCommit.subject = commit.subject.trim();
            }

            // Add proper URL links
            if (context.repository && commit.hash) {
              newCommit.commitUrl = `${context.host}/${context.owner}/${context.repository}/commit/${commit.hash}`;
            }

            return newCommit;
          },

          // Clean commit format template
          commitPartial: `* {{#if scope}}**{{scope}}:** {{/if}}{{subject}} {{#if @root.linkReferences}}([{{shortHash}}]({{commitUrl}})){{else}}({{shortHash}}){{/if}}{{#if references}}{{#each references}}, closes {{#if this.owner}}{{this.owner}}/{{/if}}{{this.repository}}#{{this.issue}}{{/each}}{{/if}}
`,

          // Customized section headers with icons
          groupBy: 'type',
          commitGroupsSort: 'title',
          commitsSort: ['scope', 'subject'],

          // Define custom section titles with icons
          commitGroupsGen: (commits, context) => {
            const typeGroups = {};

            // Group commits by type
            commits.forEach((commit) => {
              const type = commit.type || '';
              if (!typeGroups[type]) {
                typeGroups[type] = [];
              }
              typeGroups[type].push(commit);
            });

            // Map types to formatted headers with icons
            const typeToTitleMap = {
              feat: '✨ New Features',
              fix: '🐛 Bug Fixes',
              docs: '📚 Documentation',
              style: '💎 Styling',
              refactor: '📦 Code Refactoring',
              perf: '🚀 Performance Improvements',
              test: '🧪 Tests',
              build: '🔧 Build System',
              ci: '🔄 CI/CD Improvements',
              chore: '♻️ Chores & Maintenance',
              revert: '⏪ Reverts',
              security: '🔒 Security Enhancements',
              breaking: '💥 BREAKING CHANGES',
            };

            // Create the commit groups array with custom titles
            return Object.entries(typeGroups).map(([type, typeCommits]) => {
              return {
                title: typeToTitleMap[type] || type,
                commits: typeCommits,
              };
            });
          },

          // Custom footer format
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

        // Customize the version header format to include release type
        changelogVersionFormat: (version, type) => {
          // Determine release type label
          let releaseType = 'Patch';
          if (type === 'major') {
            releaseType = 'Major';
          } else if (type === 'minor') {
            releaseType = 'Minor';
          }

          // Format: ## 1.1.4 (2025-04-22) — Patch
          return `## ${version} (${new Date().toISOString().split('T')[0]}) — ${releaseType}`;
        },
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
     */
    [
      '@semantic-release/github',
      {
        assets: [], // No additional assets to upload with this release

        // Custom PR comment templates
        successComment:
          '🚀 This PR is included in version ${nextRelease.version}',
        failComment: '❌ Release automation failed with error: ${error.message}',

        // Updated Lodash template for release name with proper type indicator
        releaseNameTemplate: 'v<%= nextRelease.version %> — <%= nextRelease.type === "major" ? "Major" : (nextRelease.type === "minor" ? "Minor" : "Patch") %>',

        // Add labels to issues based on the type of pull request
        addReleases: 'bottom',
        releasedLabels: ['released', 'ready-for-production'],

        // Skip GitHub token verification in dry-run mode
        dryRun: process.env.DRY_RUN === 'true',

        // Use GH_TOKEN for GitHub authentication
        githubToken: process.env.GH_TOKEN,
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
          'README.md',   // If version references appear in README
        ],

        // Use a concise commit message that passes commitlint
        message:
          'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
      },
    ],
  ],

  /**
   * Global configuration options
   */
  ci: true,  // Indicates the release is running in a CI environment
  debug: process.env.DEBUG === 'true', // Enable debug mode when environment variable is set
  tagFormat: 'v${version}', // Format for the Git tag
}
