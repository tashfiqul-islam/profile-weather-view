/**
 * Semantic Release Configuration
 * Configuration for automated versioning and package publishing
 */

export default {
  /**
   * Branches that trigger releases
   */
  branches: [
    '+([0-9])?(.{+([0-9]),x}).x', // Maintenance branches: 1.x, 1.2.x
    'master',                      // Main release branch
    { name: 'beta', prerelease: true },  // Beta releases
    { name: 'alpha', prerelease: true }, // Alpha releases
  ],

  /**
   * Format of the release tag
   */
  tagFormat: 'v${version}',

  /**
   * CI configuration and execution options
   */
  ci: true,
  debug: process.env.DEBUG === 'true',
  dryRun: process.env.DRY_RUN === 'true',

  /**
   * Plugin configuration pipeline
   */
  plugins: [
    /**
     * Analyze commits using conventional commit format
     */
    ['@semantic-release/commit-analyzer', {
      preset: 'angular',
      releaseRules: [
        // Standard types
        { type: 'feat', release: 'minor' },
        { type: 'fix', release: 'patch' },
        // Extended types
        { type: 'docs', release: 'patch' },
        { type: 'style', release: 'patch' },
        { type: 'refactor', release: 'patch' },
        { type: 'perf', release: 'patch' },
        { type: 'build', release: 'patch' },
        { type: 'ci', release: 'patch' },
        { type: 'test', release: 'patch' },
        { type: 'chore', scope: 'deps', release: 'patch' },
        { type: 'chore', release: false },
        { type: 'security', release: 'patch' },
      ],
      parserOpts: {
        noteKeywords: ['BREAKING CHANGE', 'BREAKING CHANGES', 'BREAKING'],
      },
    }],

    /**
     * Generate formatted release notes
     */
    ['@semantic-release/release-notes-generator', {
      preset: 'angular',
      parserOpts: {
        noteKeywords: ['BREAKING CHANGE', 'BREAKING CHANGES', 'BREAKING'],
      },
      writerOpts: {
        transform: (commit, context) => {
          // Skip merge and release commits
          if (
            commit.message.startsWith('Merge branch') ||
            commit.message.startsWith('Merge pull request') ||
            (commit.message.startsWith('chore(release)') && commit.message.includes('[skip ci]'))
          ) {
            return null;
          }

          const newCommit = { ...commit };

          // Create short hash for display
          if (typeof commit.hash === 'string') {
            newCommit.shortHash = commit.hash.substring(0, 7);
          }

          // Clean up subject
          if (typeof commit.subject === 'string') {
            newCommit.subject = commit.subject.trim();
          }

          // Add URLs for the repository
          if (context.repository && commit.hash) {
            newCommit.commitUrl = `${context.host}/${context.owner}/${context.repository}/commit/${commit.hash}`;
          }

          return newCommit;
        },

        // Format templates for changelog entries
        commitPartial: `* {{#if scope}}**{{scope}}:** {{/if}}{{subject}} {{#if commitUrl}}([{{shortHash}}]({{commitUrl}})){{else}}({{shortHash}}){{/if}}\n`,
        headerPartial: `# [{{version}}]({{repository}}/compare/{{previousTag}}...{{currentTag}})\n\n`,

        // Main template controlling overall changelog format
        mainTemplate: `{{> header}}## {{#if isPatch}}Patch{{else}}{{#if isMinor}}Minor{{else}}Major{{/if}}{{/if}} ({{date}})
-----------------------------------------------------------
{{#each commitGroups}}
{{#if title}}
### {{title}}
{{/if}}

{{#each commits}}
{{> commit root=@root}}
{{/each}}
{{/each}}

{{#if noteGroups}}
{{#each noteGroups}}
### {{title}}

{{#each notes}}
* {{#if commit.scope}}**{{commit.scope}}:** {{/if}}{{text}}
{{/each}}
{{/each}}
{{/if}}`,

        // Sorting options
        commitGroupsSort: 'title',
        commitsSort: ['scope', 'subject'],

        // Group commits by type with emoji prefixes
        commitGroupsGeneratorFn: (commits) => {
          const typeMapping = {
            feat: { title: '✨ Features', order: 1 },
            fix: { title: '🐛 Bug Fixes', order: 2 },
            perf: { title: '⚡ Performance Improvements', order: 3 },
            revert: { title: '⏪ Reverts', order: 4 },
            docs: { title: '📚 Documentation', order: 5 },
            style: { title: '💎 Styles', order: 6 },
            refactor: { title: '♻️ Code Refactoring', order: 7 },
            test: { title: '✅ Tests', order: 8 },
            build: { title: '👷 Build System', order: 9 },
            ci: { title: '🔄 CI/CD', order: 10 },
            chore: { title: '🧹 Chores', order: 11 },
          };

          // Group commits by type
          const commitGroups = {};
          commits.forEach(commit => {
            const type = commit.type || 'other';
            if (!commitGroups[type]) commitGroups[type] = [];
            commitGroups[type].push(commit);
          });

          // Convert to array and add titles
          return Object.entries(commitGroups)
            .map(([type, groupCommits]) => ({
              title: typeMapping[type]?.title || `${type.charAt(0).toUpperCase() + type.slice(1)}`,
              commits: groupCommits,
              order: typeMapping[type]?.order || 99,
            }))
            .sort((a, b) => a.order - b.order);
        }
      },
    }],

    /**
     * Create/update CHANGELOG.md
     */
    ['@semantic-release/changelog', {
      changelogFile: 'CHANGELOG.md',
      changelogTitle: '# Changelog\n\nAll notable changes to profile-weather-view will be documented in this file.\n\n',
    }],

    /**
     * Update version in package.json
     */
    ['@semantic-release/npm', {
      npmPublish: false,
      pkgRoot: '.',
      verifyConditions: {
        npmPublish: false,
      },
    }],

    /**
     * Commit release assets
     */
    ['@semantic-release/git', {
      assets: [
        'CHANGELOG.md',
        'package.json',
        'bunfig.toml',
        'README.md',
      ],
      message: 'chore(release): v${nextRelease.version} [skip ci]',
    }],

    /**
     * Publish GitHub release
     */
    ['@semantic-release/github', {
      assets: [],
      successComment: '🚀 This PR is included in version ${nextRelease.version}',
      failComment: '❌ Release automation failed with error: ${error.message}',
      releasedLabels: ['released', 'ready-for-production'],
      addReleases: 'bottom',
      githubOptions: {
        request: {
          timeout: 10000,
        },
      }
    }],
  ],

  /**
   * Global repository configuration
   */
  repositoryUrl: process.env.REPOSITORY_URL || 'https://github.com/tashfiqul-islam/profile-weather-view',
};
