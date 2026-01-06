/**
 * Commitlint + czg Configuration
 *
 * Enforces Conventional Commits specification for standardized commit messages.
 * Compatible with commitlint v20.x and czg v1.12.x (cz-git CLI).
 *
 * @see https://www.conventionalcommits.org/
 * @see https://commitlint.js.org/
 * @see https://cz-git.qbb.sh/
 */

import type { UserConfig } from "@commitlint/types";
import { RuleConfigSeverity } from "@commitlint/types";

/**
 * czg (cz-git CLI) prompt configuration types.
 * @see https://cz-git.qbb.sh/config/
 */
interface CzgTypeOption {
  value: string;
  name: string;
  emoji?: string;
}

interface CzgIssuePrefixOption {
  value: string;
  name: string;
}

interface CzgPromptConfig {
  messages?: Record<string, string>;
  types?: CzgTypeOption[];
  useEmoji?: boolean;
  emojiAlign?: "left" | "center" | "right";
  useAI?: boolean;
  aiNumber?: number;
  aiModel?: string;
  scopes?: readonly string[] | string[];
  enableMultipleScopes?: boolean;
  scopeEnumSeparator?: string;
  allowCustomScopes?: boolean;
  allowEmptyScopes?: boolean;
  customScopesAlign?: "top" | "bottom" | "top-bottom" | "bottom-top";
  emptyScopesAlias?: string;
  customScopesAlias?: string;
  upperCaseSubject?: boolean;
  markBreakingChangeMode?: boolean;
  allowBreakingChanges?: readonly string[] | string[];
  allowCustomIssuePrefix?: boolean;
  allowEmptyIssuePrefix?: boolean;
  issuePrefixes?: CzgIssuePrefixOption[];
  skipQuestions?: readonly string[] | string[];
  confirmColorize?: boolean;
  maxSubjectLength?: number;
  minSubjectLength?: number;
  defaultType?: string;
  defaultScope?: string;
  defaultSubject?: string;
  defaultBody?: string;
  defaultIssues?: string;
}

interface CzgUserConfig extends Omit<UserConfig, "prompt"> {
  prompt?: CzgPromptConfig;
}

// Severity aliases for readability
const ERROR = RuleConfigSeverity.Error;
const WARNING = RuleConfigSeverity.Warning;
const DISABLED = RuleConfigSeverity.Disabled;

// ─────────────────────────────────────────────────────────────────────────────
// Regex Patterns
// ─────────────────────────────────────────────────────────────────────────────
const FORBIDDEN_PATTERNS = [/^fixup!/i, /^wip:/i, /^temp:/i, /TODO/i, /FIXME/i];
const RELEASE_COMMIT_PATTERN = /^chore\(release\):/;
const VERSION_TAG_PATTERN = /^v\d+\.\d+\.\d+/;

// ─────────────────────────────────────────────────────────────────────────────
// Project Configuration
// ─────────────────────────────────────────────────────────────────────────────

const PROJECT_SCOPES = [
  "actions", // GitHub Actions workflows
  "api", // API integration
  "bun", // Bun runtime configuration
  "build", // Build system
  "ci", // CI configuration
  "config", // App configuration
  "core", // Core logic
  "deps", // Dependencies
  "docs", // Documentation
  "hooks", // Git hooks
  "infra", // Infrastructure
  "perf", // Performance
  "release", // Release commits
  "security", // Security
  "test", // Testing
  "types", // TypeScript types
  "ui", // UI components
  "utils", // Utilities
  "weather", // Weather functionality
] as const;

const COMMIT_TYPES = [
  "feat", // New feature
  "fix", // Bug fix
  "docs", // Documentation
  "style", // Formatting (no code change)
  "refactor", // Code restructuring
  "perf", // Performance improvement
  "test", // Tests
  "build", // Build system
  "ci", // CI configuration
  "types", // Type definitions
  "chore", // Maintenance
  "revert", // Revert commit
  "security", // Security fix
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Commitlint Configuration
// ─────────────────────────────────────────────────────────────────────────────

const config: CzgUserConfig = {
  extends: ["@commitlint/config-conventional"],

  // Custom plugin for forbidden patterns
  plugins: [
    {
      rules: {
        "no-forbidden-patterns": (parsed) => {
          const text = parsed.header ?? "";
          const hasMatch = FORBIDDEN_PATTERNS.some((p) => p.test(text));
          return [
            !hasMatch,
            "Commit contains forbidden pattern (fixup!, wip:, temp:, TODO, FIXME)",
          ];
        },
      },
    },
  ],

  rules: {
    // ── Header ───────────────────────────────────────────────────────────────
    "header-max-length": [ERROR, "always", 100],
    "header-full-stop": [ERROR, "never", "."],

    // ── Type ─────────────────────────────────────────────────────────────────
    "type-enum": [ERROR, "always", [...COMMIT_TYPES]],
    "type-case": [ERROR, "always", "lower-case"],
    "type-empty": [ERROR, "never"],

    // ── Scope ────────────────────────────────────────────────────────────────
    "scope-enum": [WARNING, "always", [...PROJECT_SCOPES]],
    "scope-case": [ERROR, "always", "lower-case"],
    "scope-empty": [WARNING, "never"],

    // ── Subject ──────────────────────────────────────────────────────────────
    "subject-case": [
      ERROR,
      "never",
      ["start-case", "pascal-case", "upper-case"],
    ],
    "subject-full-stop": [ERROR, "never", "."],
    "subject-min-length": [ERROR, "always", 3],
    "subject-empty": [ERROR, "never"],

    // ── Body ─────────────────────────────────────────────────────────────────
    "body-leading-blank": [ERROR, "always"],
    "body-max-line-length": [WARNING, "always", 100],
    // Note: body-case removed - doesn't make sense for multi-line content

    // ── Footer ───────────────────────────────────────────────────────────────
    "footer-leading-blank": [ERROR, "always"],
    "footer-max-line-length": [WARNING, "always", 100],

    // ── Custom ───────────────────────────────────────────────────────────────
    "no-forbidden-patterns": [ERROR, "always"],
    "references-empty": [DISABLED], // Optional: enable if you want issue refs
  },

  // Ignore auto-generated commits
  ignores: [
    (message) => message.startsWith("Merge pull request"),
    (message) => message.startsWith("Merge branch"),
    (message) => message.startsWith("Automatic merge"),
    (message) => RELEASE_COMMIT_PATTERN.test(message), // Release commits
    (message) => VERSION_TAG_PATTERN.test(message), // Version tags
  ],

  defaultIgnores: true,
  helpUrl: "https://www.conventionalcommits.org/",

  // ─────────────────────────────────────────────────────────────────────────
  // czg Prompt Configuration (cz-git compatible)
  // @see https://cz-git.qbb.sh/config/
  // ─────────────────────────────────────────────────────────────────────────
  prompt: {
    // Prompt messages
    messages: {
      type: "Select the type of change you're committing:",
      scope: "Select the scope of this change (optional):",
      customScope: "Enter custom scope:",
      subject: "Write a SHORT, IMPERATIVE description:\n",
      body: 'Provide a LONGER description (optional). Use "|" for new lines:\n',
      breaking:
        'List any BREAKING CHANGES (optional). Use "|" for new lines:\n',
      footerPrefixesSelect: "Select the ISSUES type (optional):",
      customFooterPrefix: "Enter issue prefix:",
      footer: "List issues closed (e.g., #31, #34):\n",
      generatingByAI: "Generating commit message with AI...",
      generatedSelectByAI: "Select AI-generated subject:",
      confirmCommit: "Confirm commit with the above message?",
    },

    // Commit types with emoji support
    types: [
      {
        value: "feat",
        name: "feat:     ✨ A new feature",
        emoji: ":sparkles:",
      },
      { value: "fix", name: "fix:      🐛 A bug fix", emoji: ":bug:" },
      {
        value: "docs",
        name: "docs:     📝 Documentation only",
        emoji: ":memo:",
      },
      {
        value: "style",
        name: "style:    💄 Code style (formatting)",
        emoji: ":lipstick:",
      },
      {
        value: "refactor",
        name: "refactor: ♻️  Code refactoring",
        emoji: ":recycle:",
      },
      {
        value: "perf",
        name: "perf:     ⚡️ Performance improvement",
        emoji: ":zap:",
      },
      {
        value: "test",
        name: "test:     ✅ Add/update tests",
        emoji: ":white_check_mark:",
      },
      {
        value: "build",
        name: "build:    📦 Build system changes",
        emoji: ":package:",
      },
      {
        value: "ci",
        name: "ci:       🎡 CI configuration",
        emoji: ":ferris_wheel:",
      },
      {
        value: "types",
        name: "types:    🏷️  Type definitions",
        emoji: ":label:",
      },
      {
        value: "chore",
        name: "chore:    🔧 Maintenance tasks",
        emoji: ":wrench:",
      },
      {
        value: "revert",
        name: "revert:   ⏪ Revert a commit",
        emoji: ":rewind:",
      },
      {
        value: "security",
        name: "security: 🔒 Security improvements",
        emoji: ":lock:",
      },
    ],

    // Use emoji in output (set to false for plain text)
    useEmoji: false,

    // Emoji alignment in selector
    emojiAlign: "center",

    // Use AI to generate commit subject (requires API key)
    useAI: false,
    aiNumber: 3,
    aiModel: "gpt-4o-mini",

    // Scope configuration
    scopes: [...PROJECT_SCOPES],
    enableMultipleScopes: true,
    scopeEnumSeparator: ",",
    allowCustomScopes: true,
    allowEmptyScopes: true,
    customScopesAlign: "bottom",
    emptyScopesAlias: "empty",
    customScopesAlias: "custom",

    // Subject configuration
    upperCaseSubject: false,
    markBreakingChangeMode: false,
    allowBreakingChanges: ["feat", "fix"],

    // Footer/issue configuration
    allowCustomIssuePrefix: true,
    allowEmptyIssuePrefix: true,
    issuePrefixes: [
      { value: "closed", name: "closed:   ISSUES has been resolved" },
      { value: "related", name: "related:  Related to ISSUES" },
      { value: "ref", name: "ref:      References ISSUES" },
    ],

    // Questions to skip (empty array = ask all)
    skipQuestions: ["footerPrefix"],

    // Confirm commit before proceeding
    confirmColorize: true,

    // Max subject length (auto-calculated from header-max-length rule)
    maxSubjectLength: 100,
    minSubjectLength: 3,

    // Default values
    defaultType: "feat",
    defaultScope: "",
    defaultSubject: "",
    defaultBody: "",
    defaultIssues: "",
  },
};

export default config;
