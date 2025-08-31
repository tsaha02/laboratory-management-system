// eslint.config.js
const tseslint = require('typescript-eslint');
const prettierConfig = require('eslint-config-prettier');

module.exports = tseslint.config(
  {
    ignores: ['dist/'], // Ignore the build output directory
  },
  ...tseslint.configs.recommended,
  prettierConfig // This disables ESLint rules that conflict with Prettier
);
