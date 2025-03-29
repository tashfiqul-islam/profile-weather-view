/** @type {import("prettier").Config} */
const prettierConfig = {
  // Core formatting (existing)
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 80,
  tabWidth: 2,
  arrowParens: 'always',
  endOfLine: 'lf',

  // Enhanced JavaScript/TypeScript handling
  quoteProps: 'consistent',
  bracketSpacing: true,
  bracketSameLine: false,

  // Improved language support
  embeddedLanguageFormatting: 'auto',

  // JSX/TSX specific formatting
  jsxSingleQuote: false,

  // Markdown/Prose formatting
  proseWrap: 'preserve',

  // Advanced control
  rangeStart: 0,
  rangeEnd: Infinity,
  requirePragma: false,
  insertPragma: false,

  // Override by file pattern
  overrides: [
    {
      files: ['*.json', '*.md', '*.yml'],
      options: {
        tabWidth: 2,
      },
    },
    {
      files: ['*.ts', '*.tsx'],
      options: {
        // TypeScript-specific options
      },
    },
  ],
};

export default prettierConfig;
