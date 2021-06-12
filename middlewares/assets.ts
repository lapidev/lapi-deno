import { Context } from "oak/mod.ts";
import { exists } from "fs/mod.ts";
import { extname } from "path/mod.ts";

const MEDIA_TYPES: Record<string, string> = {
  ".md": "text/markdown",
  ".html": "text/html",
  ".htm": "text/html",
  ".json": "application/json",
  ".map": "application/json",
  ".txt": "text/plain",
  ".ts": "text/typescript",
  ".tsx": "text/tsx",
  ".js": "application/javascript",
  ".jsx": "text/jsx",
  ".gz": "application/gzip",
  ".css": "text/css",
  ".wasm": "application/wasm",
  ".mjs": "application/javascript",
  ".svg": "image/svg+xml",
};

/** Returns the content-type based on the extension of a path. */
function contentType(path: string): string | undefined {
  return MEDIA_TYPES[extname(path)];
}

export function assets(path: string, location: string) {
  return async function (ctx: Context, next: Function) {
    if (!ctx.request.url.pathname.includes(path)) {
      next();
      return;
    }

    const filePath = `${location}${ctx.request.url.pathname.replace(
      path,
      ""
    )}`;

    console.log(`${ctx.request.url.pathname} => ${filePath}`);

    if (!(await exists(filePath))) {
      next();
      return;
    }

    const fileInfo = await Deno.stat(filePath);

    if (fileInfo.isDirectory) {
      next();
      return;
    }

    const buffer = await Deno.open(filePath);
    const ct = contentType(filePath);

    if (!ct) {
      next();
      return;
    }

    ctx.response.body = buffer;
    ctx.response.headers.set("Content-type", ct);
  };
}
