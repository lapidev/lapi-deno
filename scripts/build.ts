const { success } = await Deno.run(
  { cmd: ["ssvmup", "build", "--target", "deno"] },
).status();

if (!success) {
  Deno.exit(1);
}

try {
  await Deno.remove("wasm", { recursive: true });
} catch (error) {}

await Deno.remove("pkg/README.md");
await Deno.remove("pkg/LICENSE");
await Deno.remove("pkg/package.json");
await Deno.remove("pkg/.gitignore");

await Deno.rename("pkg", "wasm");
