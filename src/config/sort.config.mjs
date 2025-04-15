import { existsSync, readFileSync } from 'fs';

// ✅ Function to Get Path Aliases from `tsconfig.json`
const getPathAliases = () => {
  const tsconfigPath = process.cwd() + '/tsconfig.json';

  if (existsSync(tsconfigPath)) {
    try {
      const tsconfig = JSON.parse(readFileSync(tsconfigPath, 'utf-8'));
      const paths = tsconfig?.compilerOptions?.paths;

      if (paths) {
        return Object.keys(paths).map((key) => key.split('/')[0] + '/.+');
      }
    } catch (error) {
      console.error('❌ Failed to read tsconfig.json:', error);
    }
  }

  return [];
};

// ✅ Named Export for ESLint Perfectionist Sorting Rules
export const getSortRules = () => ({
  'perfectionist/sort-decorators': 'off',
  'perfectionist/sort-classes': 'off',
  'perfectionist/sort-variable-declarations': ['error'],
  'perfectionist/sort-intersection-types': ['error'],
  'perfectionist/sort-heritage-clauses': ['error'],
  'perfectionist/sort-array-includes': ['error'],
  'perfectionist/sort-union-types': ['error'],
  'perfectionist/sort-switch-case': ['error'],
  'perfectionist/sort-interfaces': ['error'],
  'perfectionist/sort-modules': ['error'],
  'perfectionist/sort-objects': ['error'],
  'perfectionist/sort-enums': ['error'],
  'perfectionist/sort-sets': ['error'],
  'perfectionist/sort-maps': ['error'],
  'perfectionist/sort-object-types': [
    'error',
    { type: 'line-length', order: 'asc' },
  ],
  'perfectionist/sort-jsx-props': [
    'error',
    { type: 'line-length', order: 'asc' },
  ],
  'perfectionist/sort-imports': [
    'error',
    {
      type: 'line-length',
      order: 'asc',
      specialCharacters: 'keep',
      internalPattern: ['^~/.+', '^@/.+', ...getPathAliases()],
      partitionByComment: true,
      partitionByNewLine: false,
      newlinesBetween: 'always',
      tsconfigRootDir: process.cwd(),
    },
  ],
  'perfectionist/sort-exports': [
    'error',
    { type: 'line-length', order: 'asc' },
  ],
  'perfectionist/sort-named-imports': [
    'error',
    { type: 'line-length', order: 'asc' },
  ],
  'perfectionist/sort-named-exports': [
    'error',
    { type: 'line-length', order: 'asc' },
  ],
});
