/* eslint.config.mjs — Flat config for Obsidian plugin linting
 *
 * Uses eslint-plugin-obsidianmd's recommended rule set (the official Obsidian plugin guidelines) with projectService for type-aware TS.
 *
 * Run:  npx eslint src/
 * Fix:  npx eslint src/ --fix
 */

import obsidianmd from 'eslint-plugin-obsidianmd';
import globals from 'globals';
import { globalIgnores, defineConfig } from 'eslint/config';

export default defineConfig(
  // ── Files the linter should completely skip ──────────────────────────
  globalIgnores([
    'main.js',                  // esbuild bundle output
    'node_modules/',
    'tests/build-test-bundle.mjs',
    'esbuild.config.mjs',
    'eslint.config.mjs',        // self-ignore
    'tsconfig.json',
    'package.json',
    'package-lock.json',
    'manifest.json',
    'CHANGELOG.md',
    'LICENSE.md',
    'README.md',
    'docs/',
  ]),

  // ── Global language options (applied before recommended config) ──────
  {
    languageOptions: {
      globals: {
        ...globals.browser,   // Obsidian runs in Electron renderer
        process: 'readonly',
      },
      parserOptions: {
        projectService: {
          allowDefaultProject: [
            'eslint.config.mjs',
            'manifest.json',
          ],
        },
        tsconfigRootDir: import.meta.dirname,
        extraFileExtensions: ['.json'],
      },
    },
  },

  // ── Official Obsidian plugin best-practices ──────────────────────────
  ...obsidianmd.configs.recommended,

  // ── Project-specific rule overrides (applied last, so they win) ──────
  {
    rules: {

      // Sentence-case: allow Obsidian/Habitica proper nouns and common acronyms
      'obsidianmd/ui/sentence-case': ['warn', {
        brands: ['Habitica', 'Obsidian'],
        acronyms: ['API', 'ID', 'URL', 'GFM'],
        allowAutoFix: true
      }],

      // Additional strictness beyond the recommended set
      'obsidianmd/prefer-file-manager-trash-file': 'error',
      'obsidianmd/no-nodejs-modules': 'warn',
      'obsidianmd/platform': 'error',
    },
  },
);
