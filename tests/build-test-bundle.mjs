/*
 * Transpiles the pure-logic source modules into ESM bundles the Node test runner can import.
 *
 * The plugin source is TypeScript with an `obsidian` peer import; esbuild (already a
 * devDependency) bundles each entry point with `obsidian` marked external. Only modules whose
 * runtime code does not actually touch the Obsidian API can be imported this way — `helpers.ts`
 * re-exports `escapeRegExp` from `vault-handler.ts`, whose only `obsidian` usage is type-level
 * (erased at compile time), so the bundle has no runtime dependency on `obsidian`.
 */
import { build } from 'esbuild';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

await build({
  entryPoints: [resolve(root, 'src/helpers.ts')],
  outfile: resolve(here, 'dist/helpers.mjs'),
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: 'es2020',
  external: ['obsidian'],
  logLevel: 'warning',
});

console.log('test bundle built: tests/dist/helpers.mjs');
