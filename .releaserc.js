/**
 * Semantic Release Configuration
 * Automated versioning and package publishing based on commit conventions
 *
 * @type {import('semantic-release').GlobalConfig}
 * @see https://semantic-release.gitbook.io/semantic-release/usage/configuration
 */

// ─────────────────────────────────────────────────────────────────────────────
// Lodash Template Strings (interpolated by semantic-release at runtime)
// Using unicode escapes to prevent premature template literal evaluation
// ─────────────────────────────────────────────────────────────────────────────
const TAG_FORMAT = "v\u0024{version}";
const RELEASE_MESSAGE =
  "chore(release): v\u0024{nextRelease.version} [skip ci]\n\n\u0024{nextRelease.notes}";
const SUCCESS_COMMENT =
  "🚀 This PR is included in version \u0024{nextRelease.version}";
const FAIL_COMMENT =
  "❌ Release automation failed with error: \u0024{error.message}";

export default {
  // ─────────────────────────────────────────────────────────────────────────────
  // Branch Configuration
  // ─────────────────────────────────────────────────────────────────────────────
  branches: [
    "+([0-9])?(.{+([0-9]),x}).x", // Maintenance branches: 1.x, 1.2.x
    "master", // Main release branch
    { name: "next", prerelease: true }, // Next channel releases
    { name: "beta", prerelease: true }, // Beta releases
    { name: "alpha", prerelease: true }, // Alpha releases
  ],

  // ─────────────────────────────────────────────────────────────────────────────
  // Release Configuration
  // ─────────────────────────────────────────────────────────────────────────────
  tagFormat: TAG_FORMAT,
  ci: true,
  debug: process.env.DEBUG === "true",
  dryRun: process.env.DRY_RUN === "true",

  // ─────────────────────────────────────────────────────────────────────────────
  // Plugin Pipeline (order matters)
  // ─────────────────────────────────────────────────────────────────────────────
  plugins: [
    /**
     * Analyze commits using conventional commit format
     */
    [
      "@semantic-release/commit-analyzer",
      {
        preset: "angular",
        releaseRules: [
          // Breaking changes always trigger major release
          { breaking: true, release: "major" },
          // Standard types
          { type: "feat", release: "minor" },
          { type: "fix", release: "patch" },
          // Extended types
          { type: "docs", release: "patch" },
          { type: "style", release: "patch" },
          { type: "refactor", release: "patch" },
          { type: "perf", release: "patch" },
          { type: "build", release: "patch" },
          { type: "ci", release: "patch" },
          // Types-only changes should produce patch releases (matches commitlint types)
          { type: "types", release: "patch" },
          { type: "test", release: "patch" },
          // Dependency updates - be more specific and handle various formats
          { type: "chore", scope: "deps", release: "patch" },
          { type: "chore", scope: "actions", release: "patch" },
          { type: "chore", scope: "bun", release: "patch" },
          { type: "chore", scope: "dependencies", release: "patch" },
          // Handle commits that mention dependency updates in the message (regex)
          { type: "chore", subject: "/deps|update/i", release: "patch" },
          // Other chore commits should not trigger releases
          { type: "chore", release: false },
          { type: "security", release: "patch" },
          // Revert commits should trigger patch releases
          { type: "revert", release: "patch" },
        ],
        parserOpts: {
          noteKeywords: ["BREAKING CHANGE", "BREAKING CHANGES", "BREAKING"],
        },
      },
    ],

    /**
     * Generate formatted release notes
     */
    [
      "@semantic-release/release-notes-generator",
      {
        preset: "angular",
        parserOpts: {
          noteKeywords: ["BREAKING CHANGE", "BREAKING CHANGES", "BREAKING"],
        },
        writerOpts: {
          transform: (commit, context) => {
            // Skip merge and release commits
            if (
              commit.message.startsWith("Merge branch") ||
              commit.message.startsWith("Merge pull request") ||
              (commit.message.startsWith("chore(release)") &&
                commit.message.includes("[skip ci]"))
            ) {
              return null;
            }

            const newCommit = { ...commit };

            // Create short hash for display
            const GIT_HASH_DISPLAY_LENGTH = 7;
            if (typeof commit.hash === "string") {
              newCommit.shortHash = commit.hash.substring(
                0,
                GIT_HASH_DISPLAY_LENGTH
              );
            }

            // Clean up subject
            if (typeof commit.subject === "string") {
              newCommit.subject = commit.subject.trim();
            }

            // Add URLs for the repository
            if (context.repository && commit.hash) {
              newCommit.commitUrl = `${context.host}/${context.owner}/${context.repository}/commit/${commit.hash}`;
            }

            // Better detection for refactor commits
            if (
              newCommit.subject &&
              (newCommit.subject.includes("refactor") ||
                newCommit.subject.includes("modernize") ||
                newCommit.subject.includes("clean up"))
            ) {
              newCommit.type = "refactor";
            }

            return newCommit;
          },

          // Enhanced format templates for changelog entries
          commitPartial:
            "* {{#if scope}}**{{scope}}:** {{/if}}{{subject}} {{#if commitUrl}}([{{shortHash}}]({{commitUrl}})){{else}}({{shortHash}}){{/if}}\n",

          // Fix compare URL format to prevent duplicate repo name
          headerPartial:
            "# [{{version}}](https://github.com/{{owner}}/{{repository}}/compare/{{previousTag}}...{{currentTag}})",

          // Enhanced main template with better structure
          mainTemplate: `{{> header}}

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
          commitGroupsSort: "title",
          commitsSort: ["scope", "subject"],

          // Enhanced types array with emoji headers and better categorization
          types: [
            { type: "feat", section: "✨ Features" },
            { type: "fix", section: "🛠️ Fixes" },
            { type: "docs", section: "📚 Documentation" },
            { type: "types", section: "🌊 Types" },
            { type: "chore", section: "🏡 Chore" },
            { type: "test", section: "✅ Tests" },
            { type: "perf", section: "⚡ Performance" },
            { type: "refactor", section: "♻️ Refactors" },
            { type: "build", section: "👷 Build System" },
            { type: "ci", section: "🔄 CI/CD" },
            { type: "security", section: "🔒 Security" },
            { type: "revert", section: "⏪ Reverts" },
          ],
        },
      },
    ],

    /**
     * Create/update CHANGELOG.md
     */
    [
      "@semantic-release/changelog",
      {
        changelogFile: "CHANGELOG.md",
        changelogTitle: "# Changelog",
      },
    ],

    /**
     * Update version in package.json
     */
    [
      "@semantic-release/npm",
      {
        npmPublish: false,
        pkgRoot: ".",
      },
    ],

    /**
     * Commit release assets
     */
    [
      "@semantic-release/git",
      {
        assets: [
          "CHANGELOG.md",
          "package.json",
          "bun.lock",
          "bunfig.toml",
          "README.md",
        ],
        message: RELEASE_MESSAGE,
      },
    ],

    /**
     * Publish GitHub release
     */
    [
      "@semantic-release/github",
      {
        assets: [{ path: "CHANGELOG.md", label: "Changelog" }],
        successComment: SUCCESS_COMMENT,
        failComment: FAIL_COMMENT,
        releasedLabels: ["released", "ready-for-production"],
        addReleases: "bottom",
        discussionCategoryName: false,
        githubOptions: {
          request: {
            timeout: 10_000,
          },
        },
      },
    ],
  ],

  // ─────────────────────────────────────────────────────────────────────────────
  // Repository Configuration
  // ─────────────────────────────────────────────────────────────────────────────
  repositoryUrl:
    process.env.REPOSITORY_URL ||
    "https://github.com/tashfiqul-islam/profile-weather-view",
};
