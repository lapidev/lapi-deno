#! /usr/bin/env -S deno run --unstable --allow-read --allow-write --allow-env --import-map=import_map.json

import postcss from "https://deno.land/x/postcss/mod.js";
import autoprefixer from "https://jspm.dev/autoprefixer";
import { walk, WalkEntry } from "fs/mod.ts";
import { executeNoFail, BUILD_DIR } from "/scripts/common.ts";

const processor = postcss([autoprefixer as any]);

const files = walk("./static/css", { exts: [".css"] });

async function readContents(f: WalkEntry) {
  return new TextDecoder().decode(await Deno.readFile(f.path));
}

async function writeToBuildDir(path: string, contents: string) {
  await executeNoFail(() =>
    Deno.mkdir(`${BUILD_DIR}/${path}`.replace(/\/[a-zA-Z0-9\.]+$/, ""), {
      recursive: true,
    })
  );

  await executeNoFail(() => await Deno.create(`${BUILD_DIR}/${path}`));

  await Deno.writeFile(
    `${BUILD_DIR}/${path}`,
    new TextEncoder().encode(contents)
  );
}

for await (const f of files) {
  if (!f.isFile) break;

  const { css } = await processor.process(await readContents(f));

  await writeToBuildDir(f.path, css);
}
