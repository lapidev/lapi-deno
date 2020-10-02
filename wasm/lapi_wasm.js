let imports = {};
let wasm;

/**
* @param {number} x
* @returns {number}
*/
const square = function(x) {
    var ret = wasm.square(x);
    return ret;
};
export { square };

import * as path from 'https://deno.land/std/path/mod.ts';
import WASI from 'https://deno.land/std/wasi/snapshot_preview1.ts';
const __dirname = path.dirname(new URL(import.meta.url).pathname);
const wasi = new WASI({
    args: Deno.args,
    env: Deno.env.toObject(),
    preopens: {
        '/': __dirname
    }
});
imports = { wasi_snapshot_preview1: wasi.exports };

const p = path.join(__dirname, 'lapi_wasm_bg.wasm');
const bytes = Deno.readFileSync(p);
const wasmModule = new WebAssembly.Module(bytes);
const wasmInstance = new WebAssembly.Instance(wasmModule, imports);
wasm = wasmInstance.exports;

wasi.memory = wasmInstance.exports.memory;

