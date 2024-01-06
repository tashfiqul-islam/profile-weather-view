module.exports = {
  env: {
    node: true,
    es2021: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:node/recommended",
    "plugin:prettier/recommended",
  ],
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
  },
  rules: {
    "no-unused-vars": [
      "warn",
      { vars: "all", args: "after-used", ignoreRestSiblings: false },
    ],
    "no-console": "off",
    "consistent-return": "error",
    "array-callback-return": "warn",
    eqeqeq: ["error", "always"],
    "no-throw-literal": "error",
    "no-return-assign": ["error", "always"],
    "no-param-reassign": ["error", { props: true }],
    "no-shadow": "warn",
    "no-confusing-arrow": ["error", { allowParens: true }],
    "no-unused-expressions": [
      "error",
      { allowShortCircuit: true, allowTernary: true },
    ],
    "no-use-before-define": ["error", { functions: false, classes: true }],
    "node/no-missing-import": "error",
    "node/no-unsupported-features/es-syntax": "off",
    "prefer-const": "error",
    "prefer-template": "error",
    "template-curly-spacing": ["error", "never"],
    "prettier/prettier": "error",
  },
};
