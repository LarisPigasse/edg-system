// eslint.config.js — configurazione unica per tutti i workspace del monorepo
//
// Deve restare l'unica del repository: se ne esistono altre negli workspace,
// typescript-eslint trova più radici candidate e rifiuta di analizzare i file
// con «No tsconfigRootDir was set, and multiple candidate TSConfigRootDirs are
// present». Per lo stesso motivo la radice è dichiarata qui in modo esplicito.
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default tseslint.config(
  { ignores: ['**/dist/**', '**/node_modules/**', '_da_cancellare/**'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        // Radice esplicita: senza, il parser deve indovinarla e in un monorepo
        // con più progetti può trovarne più d'una.
        tsconfigRootDir: rootDir,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  }
);
