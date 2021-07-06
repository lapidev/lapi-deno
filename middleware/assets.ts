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
async function serveFile(ctx: Context, filePath: string) {}

/**
 * Options for configuring assets. {@see defaultAssetsOptions} for defaults.
 */
export interface AssetsOptions {
  /** Specifies to route `/` to `index.html` if it exists. */
  routeToIndex?: boolean;

  /** Computes the content type based on the path.  */
  contentType?: (path: string) => string | undefined;
}

/** Default options for assets. */
const defaultAssetsOptions = {
  routeToIndex: true,
  contentType,
};

function handler(path: string, contentType: string) {
  return async function (ctx: Context) {
    ctx.response.body = await Deno.open(path, {
      read: true,
      write: false,
    });
    ctx.response.headers.set("Content-Type", contentType);
  };
}

/** Serves an assets directory at the given path. */
export async function assets(
  basePath: string,
  assetsDirectory: string,
  opts: AssetsOptions = {},
) {
  const { routeToIndex, contentType } = { ...defaultAssetsOptions, ...opts };

  const router = new Router({ basePath });

  const realPath = await Deno.realPath(assetsDirectory);

  for await (const f of walk(realPath)) {
    if (f.isFile) {
      const pathname = f.path.replace(realPath, "");
      const contentTypeValue = contentType(f.path) || "";

      router.get(pathname, handler(f.path, contentTypeValue));

      if (routeToIndex && pathname.includes("index.html")) {
        router.get(
          pathname.replace("index.html", ""),
          handler(f.path, contentTypeValue),
        );
      }
    }
  }

  return router.routes();
}

/** Serves an asset at the given path. */
export async function asset(
  path: string,
  assetPath: string,
  opts: AssetsOptions = {},
) {
  const { routeToIndex, contentType } = { ...defaultAssetsOptions, ...opts };
  const realPath = await Deno.realPath(assetPath);

  if (!(await exists(realPath))) {
    throw new Error(`file with path ${assetPath} does not exist`);
  }

  const contentTypeValue = contentType(realPath) || "";

  const router = new Router();

  router.get(path, handler(assetPath, contentTypeValue));

  if (routeToIndex && path.includes("index.html")) {
    router.get(
      path.replace("index.html", ""),
      handler(assetPath, contentTypeValue),
    );
  }

  return router.routes();
}
