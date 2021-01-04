// Copyright 2020 Luke Shay. All rights reserved. MIT license.

import { getConfig, runAndExitOnFail } from "./common.ts";

const test = await runAndExitOnFail(
  { cmd: ["make", "test"], stdout: "piped" },
);
const config = await getConfig();

const output = await test.output();

const outputString = new TextDecoder("utf8").decode(output);

let covered = 0;
let lines = 0;

outputString.split(/(\r|\n)/g).forEach((line) => {
  let ignored = false;

  config.coverage?.ignore?.forEach((file) => {
    if (line.includes(file)) {
      ignored = true;
    }
  });

  if (line.startsWith("cover file:///") && !ignored) {
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

const percent = ((covered / lines) * 100);

console.log(`${percent.toFixed(2)}% (${covered}/${lines})`);

Deno.exit(
  config.coverage?.lineCoverage && percent < config.coverage.lineCoverage
    ? 1
    : 0,
);
