/**
 * Semantic Release Configuration
 *
 * Automates version management and release process based on commit messages.
 * @type {import('semantic-release').GlobalConfig}
 */

/** @type {import('semantic-release').GlobalConfig} */
export default {
  // Define which branches trigger releases
  branches: [
    '+([0-9])?(.{+([0-9]),x}).x', // Maintenance branches: 1.x, 1.2.x
    'master',                      // Main release branch
    { name: 'beta', prerelease: true },  // Beta releases
    { name: 'alpha', prerelease: true }, // Alpha releases
  ],

  tagFormat: 'v${version}',

  plugins: [
    /**
     * Analyze commits to determine release type
     */
    [
      '@semantic-release/commit-analyzer',
      {
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
          { type: 'workflows', release: 'minor' },
        ],
        parserOpts: {
          noteKeywords: ['BREAKING CHANGE', 'BREAKING CHANGES', 'BREAKING'],
        },
      },
    ],

    /**
     * Generate release notes from commit messages
     */
    [
      '@semantic-release/release-notes-generator',
      {
        preset: 'angular',
        parserOpts: {
          noteKeywords: ['BREAKING CHANGE', 'BREAKING CHANGES', 'BREAKING'],
        },
        writerOpts: {
          /**
           * Process each commit for formatting in release notes
           */
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

            // Add URL links for commits
            if (context.repository && commit.hash) {
              newCommit.commitUrl = `${context.host}/${context.owner}/${context.repository}/commit/${commit.hash}`;
            }

            return newCommit;
          },

          // Format for commit entries
          commitPartial: `* {{type}}: {{subject}} {{#if issue}}(#{{issue}}){{/if}} ({{shortHash}}), closes {{#if issue}}#{{issue}}{{/if}}\n`,

          groupBy: 'type',
          commitGroupsSort: 'title',
          commitsSort: ['scope', 'subject'],

          /**
           * Organize commits into sections with descriptive titles
           */
          commitGroupsGen: (commits, context) => {
            const typeGroups = {};

            // Group by commit type
            commits.forEach((commit) => {
              const type = commit.type || '';
              if (!typeGroups[type]) {
                typeGroups[type] = [];
              }
              typeGroups[type].push(commit);
            });

            // Section titles with emojis
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
              workflows: '🔄 CI/CD Improvements',
            };

            return Object.entries(typeGroups).map(([type, typeCommits]) => ({
              title: typeToTitleMap[type] || `**${type}**`,
              commits: typeCommits,
            }));
          },

          // Templates for release notes formatting
          footerPartial: `{{#if noteGroups}}
{{#each noteGroups}}

### {{title}}

{{#each notes}}
* {{#if commit.scope}}**{{commit.scope}}:** {{/if}}{{text}}
{{/each}}
{{/each}}
{{/if}}`,

          mainTemplate: `{{> header}}

{{#if isPatch}}Patch{{else}}{{#if isMinor}}Minor{{else}}Major{{/if}}{{/if}} ({{date}})

{{#each commitGroups}}
{{#if title}}
{{title}}

{{/if}}
{{#each commits}}
{{> commit root=@root}}
{{/each}}

{{/each}}
{{> footer}}`,

          headerPartial: `# {{version}}\n`,
        },
      },
    ],

    /**
     * Create/update CHANGELOG.md
     */
    [
      '@semantic-release/changelog',
      {
        changelogFile: 'CHANGELOG.md',
        changelogTitle: '# Changelog\n\nAll notable changes to profile-weather-view will be documented in this file.',
      },
    ],

    /**
     * Update version in package.json
     */
    [
      '@semantic-release/npm',
      {
        npmPublish: false, // Skip publishing to npm registry
      },
    ],

    /**
     * Create GitHub release
     */
    [
      '@semantic-release/github',
      {
        assets: [],
        successComment: '🚀 This PR is included in version ${nextRelease.version}',
        failComment: '❌ Release automation failed with error: ${error.message}',
        releasedLabels: ['released', 'ready-for-production'],
        addReleases: 'bottom',
        dryRun: process.env.DRY_RUN === 'true',
        githubToken: process.env.GH_TOKEN,
      },
    ],

    /**
     * Commit updated files back to repository
     */
    [
      '@semantic-release/git',
      {
        assets: [
          'CHANGELOG.md',
          'package.json',
          'bunfig.toml',
          'README.md',
        ],
        message: 'chore(release): ${nextRelease.version} [skip ci]',
        // Skip GPG signing in the plugin itself but keep the option to sign
        // using system GPG setup that's already configured
        gpgSign: false,
        gitCommitOptions: ['--no-verify', '--allow-empty', '--no-gpg-sign'],
      },
    ],
  ],

  // Global options
  ci: true,
  debug: process.env.DEBUG === 'true',
};
