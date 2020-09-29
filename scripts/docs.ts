// Copyright 2020 Luke Shay. All rights reserved. MIT license.

import { getProject, runAndExitOnFail } from "./common.ts";

const { version } = await getProject();

const docs = await runAndExitOnFail(
  { cmd: ["deno", "doc", "--json", "mod.ts"], stdout: "piped" },
);

const output = await docs.output();

await Deno.writeFile(`docs/api/${version}.json`, output);
await Deno.writeFile(`docs/api/latest.json`, output);

Deno.exit(0);
