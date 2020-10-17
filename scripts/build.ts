const { success } = await Deno.run(
  { cmd: ["ssvmup", "build", "--target", "deno"] },
).status();

if (!success) {
  Deno.exit(1);
}

try {
  await Deno.remove("wasm", { recursive: true });
  // deno-lint-ignore no-empty
} catch (error) {}

await Deno.mkdir("wasm");

await Deno.copyFile("pkg/lapi_wasm.js", "wasm/lapi_wasm.js");
await Deno.copyFile("pkg/lapi_wasm_bg.wasm", "wasm/lapi_wasm_bg.wasm");
