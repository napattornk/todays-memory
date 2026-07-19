import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'

export default tseslint.config(
  { ignores: ['dist', 'ios', 'android', 'node_modules'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    // Native/web Capacitor + browser APIs may only be touched inside service
    // implementation files. UI, pages, and business logic must call the
    // platform-agnostic service interfaces instead.
    files: ['src/**/*.{ts,tsx}'],
    ignores: [
      'src/services/**/*.native.ts',
      'src/services/**/*.web.ts',
      'src/services/**/index.ts',
      'src/tests/**',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@capacitor/*', '@capacitor-community/*'],
              message:
                'Capacitor plugins may only be used inside src/services/**/*.native.ts or *.web.ts implementations. Call the platform-agnostic service interface instead.',
            },
          ],
        },
      ],
    },
  },
  {
    // Idiomatic fetch-on-mount data hooks (services are async, so the
    // initial load can't be derived synchronously during render).
    files: ['src/hooks/**/*.ts'],
    rules: {
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  prettier,
)
