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
const failedFiles: string[] = [];

outputString.split(/(\r|\n)/g).forEach((line): void => {
  if (line.startsWith("cover file:///")) {
    let ignored = false;

    config.coverage?.ignore?.forEach((file): void => {
      if (line.includes(file)) {
        ignored = true;
      }
    });

    console.log(
      `${
        line.replace(/(cover | \.\.\.)/g, "").replace(
          `file://${Deno.cwd()}/`,
          "",
        )
      }${ignored ? " - ignored" : ""}`,
    );

    if (!ignored) {
      const match = line.match(/\((?<covered>\d+)\/(?<lines>\d+)/);

      if (!match?.groups?.lines || !match?.groups?.covered) {
        console.error("no coverage found");
        Deno.exit(1);
      } else {
        covered += parseInt(match.groups.covered, 10);
        lines += parseInt(match.groups.lines, 10);

        const groupCovered = parseInt(match.groups.covered, 10);
        const groupLines = parseInt(match.groups.lines, 10);

        if (
          config.coverage?.lineCoveragePerFile &&
          groupCovered / groupLines * 100 < config.coverage.lineCoveragePerFile
        ) {
          failedFiles.push(line);
        }
      }
    }
  }
});

const percent = ((covered / lines) * 100);

console.log(`Overall coverage: ${percent.toFixed(2)}% (${covered}/${lines})`);

if (failedFiles.length > 0) {
  console.log(`${failedFiles.length} file(s) failed coverage:`);
  failedFiles.forEach((file): void => console.log(`  ${file}`));
}

Deno.exit(
  (config.coverage?.lineCoverage && percent < config.coverage.lineCoverage) ||
    failedFiles.length > 0
    ? 1
    : 0,
);
