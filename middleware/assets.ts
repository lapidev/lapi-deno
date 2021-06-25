import { Router } from "./router.ts";
import { exists, extname, walk } from "../deps.ts";
import { Context } from "../context.ts";

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
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpg",
  ".webp": "image/webp",
  ".jpeg": "image/jpg",
  ".ico": "image/vnd.microsoft.icon",
};

/** Returns the content-type based on the extension of a path. */
function contentType(path: string): string | undefined {
  return MEDIA_TYPES[extname(path)];
}

/** Sets the response to the file at the given path if it exists. */
async function serveFile(ctx: Context, filePath: string) {
  ctx.response.body = await Deno.open(filePath);

  const contentTypeValue = contentType(filePath);

  if (contentTypeValue) {
    ctx.response.headers.set("Content-Type", contentTypeValue);
  }
}

/** Serves an assets directory at the given path. */
export async function assets(basePath: string, assetsDirectory: string) {
  const router = new Router({ basePath, name: "assets" });

  const realPath = await Deno.realPath(assetsDirectory);

  for await (const f of walk(realPath)) {
    if (f.isFile) {
      router.use("GET", f.path.replace(realPath, ""), async (ctx) => {
        await serveFile(ctx, f.path);
      });
    }
  }

  return router.routes();
}

/** Serves an asset at the given path. */
export async function asset(path: string, assetPath: string) {
  const realPath = await Deno.realPath(assetPath);

  if (!(await exists(realPath))) {
    throw new Error(`file with path ${assetPath} does not exist`);
  }

  return new Router({ basePath: path })
    .use("GET", "", async (ctx) => {
      await serveFile(ctx, assetPath);
    })
    .routes();
}
