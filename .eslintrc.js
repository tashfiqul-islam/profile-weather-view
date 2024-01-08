module.exports = {
  env: {
    // Environment settings
    mocha: true, // Enables global variables for Mocha
    node: true, // Enables Node.js global variables and Node.js scoping
    es2021: true, // Enables ES2021 features
  },
  extends: [
    // Base ESLint recommended rules
    'eslint:recommended',
    // Recommended rules from the node plugin
    'plugin:node/recommended',
    // Integrates Prettier for code styling
    'plugin:prettier/recommended',
  ],
  parserOptions: {
    // Specifies the ECMAScript version to lint
    ecmaVersion: 12, // Equivalent to ES2021
    sourceType: 'module', // Allows for the use of imports
  },
  rules: {
    // Custom rule settings
    'no-unused-vars': [
      'warn',
      { vars: 'all', args: 'after-used', ignoreRestSiblings: false },
    ],
    'no-console': 'off', // Allow console statements
    'consistent-return': 'error', // Require consistent return statements
    'array-callback-return': 'warn', // Enforce return statements in array method callbacks
    eqeqeq: ['error', 'always'], // Require === and !== over == and !=
    'no-throw-literal': 'error', // Disallow throwing literals as exceptions
    'no-return-assign': ['error', 'always'], // Disallow assignment in return statement
    'no-param-reassign': ['error', { props: true }], // Disallow reassigning function parameters
    'no-shadow': 'warn', // Disallow variable declarations from shadowing variables declared in the outer scope
    'no-confusing-arrow': ['error', { allowParens: true }], // Disallow arrow functions where they could be confused with comparisons
    'no-unused-expressions': [
      'error',
      { allowShortCircuit: true, allowTernary: true },
    ], // Disallow unused expressions
    'no-use-before-define': ['error', { functions: false, classes: true }], // Disallow the use of variables before they are defined
    'node/no-missing-import': 'error', // Ensure imports point to a file/module that can be resolved
    'node/no-unsupported-features/es-syntax': 'off', // Allow ES6 syntax
    'prefer-const': 'error', // Prefer const over let
    'prefer-template': 'error', // Suggest using template literals instead of string concatenation
    'template-curly-spacing': ['error', 'never'], // Disallow spacing around embedded expressions of template strings
    'prettier/prettier': 'error', // Ensures code style consistency with Prettier
    // Additional modern JS practices
    'arrow-body-style': ['error', 'as-needed'], // Require braces in arrow function body
    'no-var': 'error', // Require let or const instead of var
    'prefer-arrow-callback': 'error', // Prefer arrow functions as callbacks
    'prefer-destructuring': ['error', { object: true, array: false }], // Prefer destructuring from arrays and objects
    'prefer-rest-params': 'error', // Suggest using the rest parameters instead of arguments
    'prefer-spread': 'error', // Suggest using the spread syntax over .apply()
    'object-shorthand': ['error', 'always'], // Require or disallow method and property shorthand syntax for object literals
    'no-duplicate-imports': 'error', // Disallow duplicate module imports
    'newline-per-chained-call': ['error', { ignoreChainWithDepth: 2 }], // Require a newline after each call in a method chain
  },
};
