import tseslint from 'typescript-eslint';
import eslint from '@eslint/js';
import globals from 'globals';
import prettier from 'eslint-plugin-prettier';
import perfectionistPlugin from 'eslint-plugin-perfectionist';
import stylisticPlugin from '@stylistic/eslint-plugin';
import sonarjsPlugin from 'eslint-plugin-sonarjs';
import unicornPlugin from 'eslint-plugin-unicorn';
import securityPlugin from 'eslint-plugin-security';
import eslintCommentsPlugin from 'eslint-plugin-eslint-comments';

// ✅ Importing modular rule configurations
import { getParserProjects } from './src/config/parser.config.mjs';
import { getPrettierRules } from './src/config/eslint-prettier.config.mjs';
import { getSortRules } from './src/config/sort.config.mjs';
import { getStylisticRules } from './src/config/stylistic.config.mjs';
import { getUnicornRules } from './src/config/unicorn.config.mjs';
import { getSecurityRules } from './src/config/security.config.mjs';
import { getCommentsRules } from './src/config/comments.config.mjs';

// ✅ TypeScript parser options
const tsParserOptions = {
  projectService: true,
  tsconfigRootDir: process.cwd(),
  project: getParserProjects(),
};

// ✅ ESLint Configuration
export default tseslint.config(
  { files: ['**/*.{ts,js}'] },
  eslint.configs.recommended,

  // ✅ TypeScript Rules
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: tsParserOptions,
      globals: {
        ...globals.node,
      },
    },
  },

  // ✅ SonarJS (Detects Code Smells)
  {
    plugins: { sonarjs: sonarjsPlugin },
    rules: sonarjsPlugin.configs.recommended.rules,
  },

  // ✅ Unicorn (Modern JS Best Practices)
  {
    plugins: { unicorn: unicornPlugin },
    rules: getUnicornRules(),
  },

  // ✅ Security Rules
  {
    plugins: { security: securityPlugin },
    rules: getSecurityRules(),
  },

  // ✅ Perfectionist (Sort and Organize Code)
  {
    plugins: { perfectionist: perfectionistPlugin },
    rules: getSortRules(),
    settings: {
      perfectionist: {
        type: 'alphabetical',
        order: 'asc',
        partitionByComment: true,
      },
    },
  },

  // ✅ Stylistic Rules
  {
    plugins: { '@stylistic': stylisticPlugin },
    rules: getStylisticRules(),
  },

  // ✅ Prettier Integration
  {
    plugins: { prettier },
    rules: getPrettierRules(),
  },

  // ✅ ESLint Comments Rules
  {
    plugins: { 'eslint-comments': eslintCommentsPlugin },
    rules: getCommentsRules(),
  },

  // ✅ Test-Specific Rules (Unit Tests / Integration Tests)
  {
    files: ['**/*.{test,spec}.{ts,js}'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },

  // ✅ Common Rules
  {
    rules: {
      'newline-before-return': 'error',
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-shadow': 'off',
      '@typescript-eslint/no-shadow': ['error'],
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        {
          allowBoolean: true,
          allowNumber: true,
        },
      ],
    },
  },

  // ✅ Ignore Non-Relevant Files
  {
    ignores: [
      'node_modules/',
      'dist/',
      'coverage/',
      '.git/',
      '.github/',
      '.bunfig.toml',
      'bun.lockb',
      '.env',
      '*.md',
      '*.json',
      '*.lock',
      '*.log',
      'src/config/*.config.mjs',
      'src/docs/',
      'package.json',
      'tsconfig.json',
      'tsconfig.test.json',
      'prettier.config.mjs',
      'eslint.config.mjs',
      'src_old/',
      'vitest.config.ts',
      'commitlint.config.mjs',
      'postcss.config.mjs',
    ],
  },
);
