import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";
import tseslint from 'typescript-eslint';

export default defineConfig([
  {
    ignores: ["dist/", "node_modules/"]
  },
  {
    files: ['**/*.ts'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
    ],
    languageOptions: {
      globals: {
        ecmaVersion: 2022,
        sourceType: 'module',
        globals: globals.node
      }
    },
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    }
  }
]);