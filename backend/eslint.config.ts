import js from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import { defineConfig } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig(
  { ignores: ['node_modules', 'dist', 'build'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  // ...tseslint.configs.recommendedTypeChecked, //slow performance
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    languageOptions: {
      // ParserOptions: {
      //   project: ['./tsconfig.json'],
      //   tsconfigRootDir: import.meta.dirname,
      // },
      globals: globals.node,
    },

    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-console': 'warn',
      'no-lonely-if': 'warn',
      'no-unexpected-multiline': 'warn',
    },
  },
  eslintConfigPrettier,
)
