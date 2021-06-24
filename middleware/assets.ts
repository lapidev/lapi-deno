import { Router } from "./router.ts";
import { exists, extname } from "../deps.ts";

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
};

/** Returns the content-type based on the extension of a path. */
function contentType(path: string): string | undefined {
  return MEDIA_TYPES[extname(path)];
}

/** Serves an assets directory at the given path. */
export function assets(basePath: string, assetsDirectory: string) {
  console.log(`serving file ${assetsDirectory}`);
  return new Router({ basePath })
    .use("GET", "/.*", async (ctx) => {
      const filePath =
        `${assetsDirectory}/${ctx.request.url.pathname.replace(basePath, "")}`.replaceAll("//", "/");

      if (await exists(filePath)) {
        ctx.response.body = await Deno.open(filePath);
 
        const contentTypeValue = contentType(filePath);

        if (contentTypeValue) {
          ctx.response.headers.set("Content-Type", contentTypeValue);
        }
      }
    })
    .routes();
}
