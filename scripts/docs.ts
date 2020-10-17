// Copyright 2020 Luke Shay. All rights reserved. MIT license.

import { getVersion, runAndExitOnFail } from "./common.ts";

const version = await getVersion();

const docs = await runAndExitOnFail(
  { cmd: ["deno", "doc", "--json", "mod.ts"], stdout: "piped" },
);

const output = await docs.output();

await Deno.writeFile(`docs/api/${version}.json`, output);
await Deno.writeFile(`docs/api/latest.json`, output);

Deno.exit(0);
