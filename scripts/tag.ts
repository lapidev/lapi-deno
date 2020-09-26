// Copyright 2020 Luke Shay. All rights reserved. MIT license.

import { VERSION } from "../mod.ts";

async function runAndExitOnFail(opts: Deno.RunOptions): Promise<Deno.Process> {
  const run = Deno.run(opts);

  const status = await run.status();

  if (!status) {
    console.error(`%cCommand failed: ${opts}`, "color:red;font-weight:bold");
    Deno.exit(1);
  }

  return run;
}

async function tag(): Promise<void> {
  await runAndExitOnFail({ cmd: ["git", "tag", VERSION] });

  const docs = await runAndExitOnFail(
    { cmd: ["deno", "doc", "--json", "mod.ts"], stdout: "piped" },
  );

  const output = await docs.output();

  await Deno.writeFile(`docs/${VERSION}.json`, output);
  await Deno.writeFile(`docs/latest.json`, output);

  Deno.exit(0);
}

await tag();
