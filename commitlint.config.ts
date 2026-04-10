import type { UserConfig } from '@commitlint/types';

const Configuration: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'revert',
        'types',
        'security',
      ],
    ],
    'scope-enum': [
      2,
      'always',
      ['weather', 'deps', 'ci', 'release', 'config', 'docs', 'test', 'build', 'actions', 'bun'],
    ],
    'header-max-length': [2, 'always', 100],
    'subject-max-length': [2, 'always', 72],
    'body-max-length': [2, 'always', 500],
  },
};

export default Configuration;
