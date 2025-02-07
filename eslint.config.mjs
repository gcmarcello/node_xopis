// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  {
    rules: {
      '@/semi': ['warn', 'always'],
      '@/quotes': ['warn', 'single', { "avoidEscape": true }],
      'no-multiple-empty-lines': ['warn', { 'max': 1 }],
    }
  }
);
