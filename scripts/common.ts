// Copyright 2020 Luke Shay. All rights reserved. MIT license.

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
  return new TextDecoder().decode(await process.output())
}
