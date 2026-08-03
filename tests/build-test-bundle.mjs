/*
 * Transpiles the pure-logic source modules into an ESM bundle the Node test runner can import.
 *
 * The plugin source is TypeScript with an `obsidian` peer import; esbuild (already a devDependency) bundles the test barrel with `obsidian` marked external. Only modules whose runtime code does not actually touch the Obsidian API can be imported this way — all re-exported functions are pure logic with type-level-only obsidian usage (erased at compile time), so the bundle has no runtime dependency on `obsidian`.
 */
import { build } from 'esbuild';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const here = dirname(fileURLToPath(import.meta.url));

await build({
  entryPoints: [resolve(here, 'test-barrel.ts')],
  outfile: resolve(here, 'dist/barrel.mjs'),
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: 'es2020',
  external: ['obsidian'],
  logLevel: 'warning',
});

console.log('test bundle built: tests/dist/barrel.mjs');
