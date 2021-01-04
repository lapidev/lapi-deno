// Copyright 2020 Luke Shay. All rights reserved. MIT license.

import { getVersion, runAndExitOnFail } from "./common.ts";

const test = await runAndExitOnFail(
  { cmd: ["make", "test"], stdout: "piped" },
);

const output = await test.output();

const outputString = new TextDecoder("utf8").decode(output);

let covered = 0;
let lines = 0;

outputString.split(/(\r|\n)/g).forEach((line) => {
  if (line.startsWith("cover file:///")) {
    const match = line.match(/\((?<covered>\d+)\/(?<lines>\d+)/);

    if (!match?.groups?.lines || !match?.groups?.covered) {
      console.error("no coverage found");
      Deno.exit(1);
    } else {
      covered += parseInt(match.groups.covered, 10);
      lines += parseInt(match.groups.lines, 10);
    }
  }
});

const percent = ((covered / lines) * 100)

console.log(`${percent.toFixed(2)}% (${covered}/${lines})`);

Deno.exit(percent < 75 ? 1 : 0)
