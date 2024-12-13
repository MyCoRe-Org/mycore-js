import eslint from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import tsdoc from 'eslint-plugin-tsdoc';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default tseslint.config(
  {
    ignores: ['dist/', 'node_modules/'],
  },
  eslint.configs.recommended,
  {
    files: ['src/**/*.ts'],
    extends: [
      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.strictTypeChecked,
    ],
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      tsdoc,
    },
    languageOptions: {
      globals: globals.browser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        project: true,
      },
    },
    rules: {
      'tsdoc/syntax': 'warn',
    },
  },
  {
    languageOptions: {
      globals: globals.browser,
    },
  },
  eslintPluginPrettierRecommended
);
