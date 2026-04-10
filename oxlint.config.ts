import { defineConfig } from 'oxlint';

export default defineConfig({
  plugins: ['typescript', 'unicorn', 'oxc'],
  categories: {
    correctness: 'error',
    suspicious: 'warn',
  },
  ignorePatterns: ['dist/', 'coverage/', 'node_modules/', '*.md', 'src/docs/'],
});
