// Copyright 2020 Luke Shay. All rights reserved. MIT license.
const decoder = new TextDecoder("utf8");

export async function runAndExitOnFail(
  opts: Deno.RunOptions,
): Promise<Deno.Process> {
  const run = Deno.run(opts);

  const status = await run.status();

  if (!status) {
    console.error(`%cCommand failed: ${opts}`, "color:red;font-weight:bold");
    Deno.exit(1);
  }

  return run;
}

export async function decodeOutput(process: Deno.Process): Promise<string> {
  return decoder.decode(await process.output());
}

export interface Project {
  version: string;
  scopes: string[];
}

export async function getVersion(): Promise<string> {
  return decoder.decode(await Deno.readFile("./version.txt")).split(/\r?\n/)[0];
}

export interface Config {
  coverage?: {
    lineCoverage?: number;
    ignore: string[];
  };
}

export async function getConfig(): Promise<Config> {
  return JSON.parse(decoder.decode(await Deno.readFile("./config.json")));
}
