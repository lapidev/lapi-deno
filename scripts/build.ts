Deno.chdir("wasm");

const { success } = await Deno.run(
  { cmd: ["ssvmup", "build", "--target", "deno"] },
).status();

Deno.chdir("../");

if (!success) {
  Deno.exit(1);
}
