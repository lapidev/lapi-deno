// Copyright 2020 Luke Shay. All rights reserved. MIT license.

import { decodeOutput, runAndExitOnFail } from "./common.ts";

const COVERAGE_THRESHOLD = 80;

export interface Coverage {
  file: string;
  coverage: number;
}

async function getFiles(): Promise<string[]> {
  return (await decodeOutput(
    (await runAndExitOnFail(
      {
        cmd: ["find", "lib", "-type", "f"],
        stdout: "piped",
      },
    )),
  )).split(/\r?\n/).filter((file) =>
    !file.match(/^\n?$/) && !file.includes("_test.ts")
  );
}

async function runTests(): Promise<Coverage[]> {
  const run = Deno.run({ cmd: ["make", "test"], stdout: "piped" });

  const status = await run.status();
  const output = await decodeOutput(run);

  console.log("------------ Test Output ------------");

  console.log(output);

  console.log("-------------------------------------\n");

  if (!status) {
    console.log("Test run failed.");
    Deno.exit(1);
  }

  const coverages = output.split(/\r?\n/).filter((line) =>
    line.startsWith(`file://${Deno.cwd()}`)
  ).map((line) => {
    const file = line.replace(/ .*$/g, "").replace(`file://${Deno.cwd()}/`, "");
    const coverage = parseFloat(line.replace(/^.*3\dm/g, ""));

    return {
      file,
      coverage,
    };
  });

  return coverages;
}

const files = await getFiles();

const coverages = await runTests();

if (coverages.length < files.length) {
  files.forEach((file) => {
    if (coverages.filter((coverage) => coverage.file === file).length === 0) {
      console.log(`No tests found for ${file}.`);
    }
  });

  Deno.exit(1);
}

const lowCoverage = coverages.filter((coverage) =>
  coverage.coverage < COVERAGE_THRESHOLD
);

if (lowCoverage.length > 0) {
  lowCoverage.forEach((coverage) => {
    console.log(
      `File ${coverage.file} is below test coverage threshold: \x1b[0m\x1b[31m${coverage.coverage}%\x1b[0m`,
    );
  });

  console.log(`\nCoverage threshold: ${COVERAGE_THRESHOLD}%\n`);
  Deno.exit(1);
}
