// Copyright 2020 Luke Shay. All rights reserved. MIT license.
import { parse } from "https://deno.land/std@0.70.0/encoding/yaml.ts";

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

export async function getProject(): Promise<Project> {
  return parse(
    decoder.decode(await Deno.readFile("./project.yaml")),
  ) as Project;
}
