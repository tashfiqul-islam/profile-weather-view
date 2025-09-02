/**
 * Commitlint Configuration
 *
 * This config enforces the Conventional Commits specification to ensure
 * standardized commit messages across the project, enabling automated
 * versioning, changelog generation, and release notes.
 *
 * @see https://www.conventionalcommits.org/
 * @see https://commitlint.js.org/
 */

import { RuleConfigSeverity } from "@commitlint/types";

// Severity levels for better readability
const ERROR = RuleConfigSeverity.Error;
const WARNING = RuleConfigSeverity.Warning;
const DISABLED = RuleConfigSeverity.Disabled;

// Project-specific scopes with descriptions
const PROJECT_SCOPES = [
  "actions", // GitHub Actions workflows
  "api", // API integration and communication
  "bun", // Bun runtime and configuration
  "build", // Build system and compilation
  "ci", // Continuous integration configuration
  "config", // Application configuration
  "core", // Core application logic
  "deps", // Dependencies and external libraries
  "docs", // Documentation
  "hooks", // Git hooks and automation
  "infra", // Infrastructure and deployment
  "perf", // Performance improvements
  "release", // Release automation commits
  "security", // Security enhancements
  "test", // Testing infrastructure and tests
  "types", // TypeScript types and interfaces
  "ui", // User interface components
  "utils", // Utility functions and helpers
  "weather", // Weather-related functionality
];

// Character limits for different parts of the commit message
const LIMITS = {
  headerMaxLength: 100,
  bodyMaxLineLength: 100,
  footerMaxLineLength: 100,
};

// Minimum length for commit subject
const SUBJECT_MIN_LENGTH = 3;

// Forbidden patterns in commit messages
const FORBIDDEN_PATTERNS = [/^fixup!/, /^wip:/i, /^temp:/i, /TODO/, /FIXME/];

export default {
  // Extend conventional commits configuration
  extends: ["@commitlint/config-conventional"],

  // Custom parsers and plugins
  plugins: [
    {
      rules: {
        "no-forbidden-patterns": (
          parsed,
          _when,
          patterns = FORBIDDEN_PATTERNS
        ) => {
          const { subject, header } = parsed;
          const hasMatch = patterns.some(
            (pattern) =>
              pattern.test(header) || (subject && pattern.test(subject))
          );
          return [
            !hasMatch,
            `Commit message contains forbidden pattern: ${patterns.map((p) => p.toString()).join(", ")}`,
          ];
        },
      },
    },
  ],

  // Enhanced rules configuration
  rules: {
    // Header validations
    "header-max-length": [ERROR, "always", LIMITS.headerMaxLength],
    "header-case": [WARNING, "never", ["upper-case"]], // Changed to warning and allowing mixed case
    "header-full-stop": [ERROR, "never", "."],

    // Type validations
    "type-enum": [
      ERROR,
      "always",
      [
        "feat", // New feature
        "fix", // Bug fix
        "docs", // Documentation
        "style", // Formatting changes
        "refactor", // Code refactoring
        "perf", // Performance improvement
        "test", // Testing
        "build", // Build system
        "ci", // CI configuration
        "chore", // Maintenance
        "revert", // Revert previous commit
        "security", // Security improvements
      ],
    ],
    "type-case": [ERROR, "always", "lower-case"],
    "type-empty": [ERROR, "never"],

    // Scope validations
    "scope-enum": [WARNING, "always", PROJECT_SCOPES],
    "scope-case": [ERROR, "always", "lower-case"],
    "scope-empty": [WARNING, "never"],

    // Subject validations
    "subject-case": [
      ERROR,
      "never",
      ["start-case", "pascal-case", "upper-case"],
    ],
    "subject-full-stop": [ERROR, "never", "."],
    "subject-exclamation-mark": [WARNING, "never"],
    "subject-min-length": [ERROR, "always", SUBJECT_MIN_LENGTH],

    // Body validations - Relaxed for release commits
    "body-leading-blank": [ERROR, "always"],
    "body-max-line-length": (ctx) => {
      // Safely check type and scope before disabling
      if (ctx?.type === "chore" && ctx?.scope === "release") {
        return [DISABLED];
      }
      return [ERROR, "always", LIMITS.bodyMaxLineLength];
    },
    "body-case": [WARNING, "always", "sentence-case"],

    // Footer validations - Relaxed for release commits
    "footer-leading-blank": [ERROR, "always"],
    "footer-max-line-length": (ctx) => {
      // Safely check type and scope before disabling
      if (ctx?.type === "chore" && ctx?.scope === "release") {
        return [DISABLED];
      }
      return [ERROR, "always", LIMITS.footerMaxLineLength];
    },

    // Custom rules
    "no-forbidden-patterns": [ERROR, "always"],
    "references-empty": [WARNING, "never"],
  },

  // Ignore conventional preset rules
  ignores: [
    // Ignore Github's auto-generated commit messages
    (message) => message.startsWith("Merge pull request"),
    (message) => message.startsWith("Automatic merge"),
  ],

  // Default settings for prompt UI
  defaultIgnores: true,
  helpUrl:
    "https://github.com/conventional-changelog/commitlint/#what-is-commitlint",

  // Interactive commit prompt configuration
  prompt: {
    settings: {
      // Enable selection of multiple scopes (comma separated)
      enableMultipleScopes: true,
      scopeEnumSeparator: ",",

      // Customizable question mark symbols
      questionMarkPrefix: "🔍",

      // Skip prompts configuration
      skipQuestions: ["footerPrefix", "isBreaking"],

      // Default type
      defaultType: "feat",

      // Provide examples for commit message
      messages: {
        skip: ":skip",
        max: "upper %d chars",
        min: "%d chars at least",
        emptyWarning: "cannot be empty",
        upperLimitWarning: "over limit",
        lowerLimitWarning: "below limit",
      },

      // Custom questions and validations
      questions: {
        type: {
          description: "Select the type of change you are committing:",
          enum: {
            feat: {
              description: "A new feature",
              title: "Features",
              emoji: "✨",
            },
            fix: {
              description: "A bug fix",
              title: "Bug Fixes",
              emoji: "🐛",
            },
            docs: {
              description: "Documentation only changes",
              title: "Documentation",
              emoji: "📚",
            },
            style: {
              description: "Changes that do not affect the meaning of the code",
              title: "Styles",
              emoji: "💎",
            },
            refactor: {
              description:
                "A code change that neither fixes a bug nor adds a feature",
              title: "Code Refactoring",
              emoji: "📦",
            },
            perf: {
              description: "A code change that improves performance",
              title: "Performance Improvements",
              emoji: "🚀",
            },
            test: {
              description: "Adding missing tests or correcting existing tests",
              title: "Tests",
              emoji: "🧪",
            },
            build: {
              description:
                "Changes that affect the build system or external dependencies",
              title: "Builds",
              emoji: "🔧",
            },
            ci: {
              description: "Changes to CI configuration files and scripts",
              title: "Continuous Integrations",
              emoji: "⚙️",
            },
            chore: {
              description: "Other changes that don't modify src or test files",
              title: "Chores",
              emoji: "♻️",
            },
            revert: {
              description: "Reverts a previous commit",
              title: "Reverts",
              emoji: "🗑",
            },
            security: {
              description: "Security improvements",
              title: "Security",
              emoji: "🔒",
            },
          },
        },
      },
    },
  },

  // Integration with release tools
  release: {
    preset: "angular",
    parserOpts: {
      noteKeywords: ["BREAKING CHANGE", "BREAKING CHANGES", "BREAKING"],
    },
  },
};
