import { existsSync } from 'fs';

export const getPrettierRules = async () => {
  let rules = {
    singleQuote: true,
  };

  if (existsSync(process.cwd() + '/.prettierrc.js')) {
    const { default: prettierConfig } = await import(
      process.cwd() + '/.prettierrc.js'
    );
    rules = prettierConfig;
  }

  return {
    'prettier/prettier': ['error', rules],
  };
};
