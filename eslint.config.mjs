import eslint from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import tsdoc from 'eslint-plugin-tsdoc';

export default tseslint.config({
  languageOptions: {
    parserOptions: {
      globals: {
        ...globals.browser,
      },
      project: true,
    },
  },
  extends: [
    eslint.configs.recommended,
    tseslint.configs.recommendedTypeChecked,
    tseslint.configs.strictTypeChecked,
    tseslint.configs.stylisticTypeChecked,
  ],
  ignores: [
    'node_modules/**',
    'eslint.config.mjs'
  ],
  plugins: {
    tsdoc,
  },
  rules: {
    '@typescript-eslint/explicit-member-accessibility': [
      'error', {
        accessibility: 'explicit',
        overrides: {
          constructors: 'no-public',
        },
      }
    ],
    'max-len': [
      'error', {
        code: 100,
        tabWidth: 2,
        ignoreComments: true,
        ignoreUrls: true,
      },
    ],
    'no-trailing-spaces': 'error',
    'quotes': [
      'warn', 'single', {
        'avoidEscape': true
      }
    ],
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    'semi': 'error',
    'tsdoc/syntax': 'error',
  },
});
