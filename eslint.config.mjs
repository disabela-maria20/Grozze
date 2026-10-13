// eslint.config.mjs
import { globalIgnores } from 'eslint/config';
import js from '@eslint/js';
import nextPlugin from '@next/eslint-plugin-next';
import reactRecommended from 'eslint-plugin-react/configs/recommended.js';
import hooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

// Feature architecture: outras features e entidades só pelo index público
const importPatterns = [
  {
    group: ['@/features/*/*'],
    message: 'Importe outra feature pelo index público: @/features/<nome>',
  },
  {
    group: ['@/entities/*/*'],
    message: 'Importe a entidade pelo index público: @/entities/<nome>',
  },
  {
    // Barrels: quem está fora da pasta importa pelo index
    group: [
      '@/shared/api/*',
      '@/shared/store/*',
      '@/shared/ui/*',
      '../api/*',
      '../schema/*',
      '../components/*',
      '../dialogs/*',
      '../hooks/*',
      '../lib/*',
    ],
    message: 'Importe pelo barrel da pasta (ex.: @/shared/ui, ../api).',
  },
];

/** Camadas: shared < entities < features. Uma camada não importa as de cima. */
const layerRule = (forbidden) => ({
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          ...importPatterns,
          {
            group: forbidden,
            message:
              'Camada de baixo não importa camada de cima (shared < entities < features).',
          },
        ],
      },
    ],
  },
});

export default [
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    ...reactRecommended,
    languageOptions: {
      ...reactRecommended.languageOptions,
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    plugins: {
      ...reactRecommended.plugins,
      'react-hooks': hooks,
      'jsx-a11y': jsxA11y,
      '@typescript-eslint': tsPlugin,
      '@next/next': nextPlugin,
    },
    rules: {
      ...reactRecommended.rules,
      ...hooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      ...tsPlugin.configs.recommended.rules,
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      'react/prop-types': 'off',
      'react/jsx-uses-vars': 'error',
      // O TypeScript já checa identificadores indefinidos
      'no-undef': 'off',
      // Imagens vêm de URLs arbitrárias do CMS; não usamos next/image
      '@next/next/no-img-element': 'off',
      // Labels com texto dentro de <span><strong>…</strong></span>
      'jsx-a11y/label-has-associated-control': ['error', { depth: 3 }],
      'no-restricted-imports': [
        'error',
        {
          patterns: importPatterns,
        },
      ],
    },
  },
  {
    files: ['src/shared/**'],
    ...layerRule(['@/entities', '@/entities/*', '@/features', '@/features/*']),
  },
  {
    files: ['src/entities/**'],
    ...layerRule(['@/features', '@/features/*']),
  },
  prettierConfig,
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': 'error',
    },
  },
];
