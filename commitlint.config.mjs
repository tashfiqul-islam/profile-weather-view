/**
 * Commitlint Configuration
 * Enforces conventional commit message format for better changelog generation
 */

export default {
  extends: ['@commitlint/config-conventional'],

  // Custom rules for commit messages
  rules: {
    // Enforce body line length
    'body-max-line-length': [2, 'always', 100],

    // Ensure the subject is not empty and follows case convention
    'subject-case': [2, 'never', ['start-case', 'pascal-case', 'upper-case']],

    // Enforce scope naming conventions
    'scope-enum': [
      2,
      'always',
      [
        'docs', // Documentation changes
        'config', // Configuration changes
        'weather', // Weather-related functionality
        'ui', // User interface
        'test', // Testing infrastructure
        'deps', // Dependencies
        'ci', // Continuous integration
      ],
    ],
  },

  // Help message configuration
  helpUrl:
    'https://github.com/conventional-changelog/commitlint/#what-is-commitlint',

  // Custom prompt settings for interactive commits
  prompt: {
    settings: {
      enableMultipleScopes: true,
      scopeEnumSeparator: ',',
    },
    messages: {
      skip: ':skip',
      max: 'upper %d chars',
      min: '%d chars at least',
      emptyWarning: 'can not be empty',
      upperLimitWarning: 'over limit',
      lowerLimitWarning: 'below limit',
    },
  },
};
