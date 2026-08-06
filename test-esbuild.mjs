import esbuild from 'esbuild';
const result = await esbuild.build({
  stdin: {
    contents: `import wasm from 'sql.js/dist/sql-wasm.wasm'; console.log(wasm.substring(0, 50));`,
    resolveDir: process.cwd()
  },
  bundle: true,
  loader: { '.wasm': 'base64' },
  write: false,
  format: 'esm'
});
console.log(result.outputFiles[0].text.substring(0, 100));
