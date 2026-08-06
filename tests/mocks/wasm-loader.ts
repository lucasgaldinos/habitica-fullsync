import fs from 'fs';
import path from 'path';
const wasmPath = path.resolve(__dirname, '../../node_modules/sql.js/dist/sql-wasm.wasm');
const buffer = fs.readFileSync(wasmPath);
export default buffer.toString('base64');
