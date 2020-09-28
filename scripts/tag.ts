// Copyright 2020 Luke Shay. All rights reserved. MIT license.

import { VERSION } from "../mod.ts";
import { runAndExitOnFail } from "./common.ts";

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
