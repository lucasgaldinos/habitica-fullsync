import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    alias: {
      'obsidian': '/tests/mocks/obsidian.ts',
      'sql.js/dist/sql-wasm.wasm': '/tests/mocks/wasm-loader.ts'
    }
  }
});
