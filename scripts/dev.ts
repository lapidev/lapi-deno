#! /usr/bin/env -S deno run --unstable --allow-run --allow-read

import { delay } from "https://deno.land/std@0.98.0/async/mod.ts";

const cmd = ["./application.ts"];

let p = Deno.run({
  cmd,
});

const watcher = Deno.watchFs(".");

for await (const event of watcher) {
  if (
    event.paths.filter(
      (p) =>
        !p.includes("dev.ts") &&
        (p.includes(".css") || p.includes(".ts") || p.includes(".ejs"))
    ).length === 0
  ) {
    break;
  }

  console.log("restarting application");
  await p.close();
  await delay(500);
  p = Deno.run({ cmd });
}
