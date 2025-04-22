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
  // Perfectionist plugin rules (excluding sort-imports)
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
    { type: 'natural', order: 'asc' },
  ],
  'perfectionist/sort-jsx-props': [
    'error',
    { type: 'natural', order: 'asc' },
  ],

  // Disable perfectionist's sort-imports to avoid schema conflicts
  'perfectionist/sort-imports': 'off',

  // Use simple-import-sort instead for import sorting
  'simple-import-sort/imports': 'error',
  'simple-import-sort/exports': 'error',

  // Other perfectionist rules
  'perfectionist/sort-exports': [
    'error',
    { type: 'natural', order: 'asc' },
  ],
  'perfectionist/sort-named-imports': [
    'error',
    { type: 'natural', order: 'asc' },
  ],
  'perfectionist/sort-named-exports': [
    'error',
    { type: 'natural', order: 'asc' },
  ],
});
