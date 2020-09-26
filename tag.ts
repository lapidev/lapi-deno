import { VERSION } from "./version.ts";

async function version(): Promise<void> {
  const tag = Deno.run({ cmd: ["git", "tag", VERSION] });

  let status = await tag.status();

  if (!status.success) return;

  const docs = Deno.run(
    { cmd: ["deno", "doc", "--json", "mod.ts"], stdout: "piped" },
  );

  status = await docs.status();

  if (!status.success) return;

  const output = await docs.output();

  await Deno.writeFile(`docs/${VERSION}.json`, output);
  await Deno.writeFile(`docs/latest.json`, output);

  const add = Deno.run({ cmd: ["git", "add", "docs"] });

  status = await add.status();

  if (!status.success) return;

  const commit = Deno.run(
    { cmd: ["git", "commit", "-m", `docs: docs for version ${VERSION}`] },
  );

  status = await commit.status();

  if (!status.success) return;

  const push = Deno.run({ cmd: ["git", "push", "--tags"] });

  status = await push.status();

  if (!status.success) return;
}

await version();
