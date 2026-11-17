import { RuleConfigSeverity, type UserConfig } from '@commitlint/types';

const ERROR = RuleConfigSeverity.Error;

export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      ERROR,
      'always',
      [
        'feat',
        'fix',
        'perf',
        'refactor',
        'test',
        'docs',
        'style',
        'build',
        'ci',
        'chore',
        'revert',
        'security',
      ],
    ],
    'scope-enum': [
      ERROR,
      'always',
      ['weather', 'deps', 'actions', 'bun', 'ci', 'config', 'docs', 'release', 'test', 'tooling'],
    ],
    'header-max-length': [ERROR, 'always', 100],
    'body-max-line-length': [ERROR, 'always', 100],
  },
} satisfies UserConfig;
