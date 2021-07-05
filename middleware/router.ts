// Copyright 2020 Luke Shay. All rights reserved. MIT license.
/* @module lapi/middleware/router */

import { compose, ComposedMiddleware, Middleware } from "../middleware.ts";
import { Context } from "../context.ts";
import { match, MatchFunction } from "../deps.ts";

export type Method =
  | "POST"
  | "GET"
  | "DELETE"
  | "PUT"
  | "OPTIONS"
  | "HEAD"
  | "TRACE"
  | "PATCH";

function route(
  method: Method,
  matcher: MatchFunction,
  handleOptions: boolean,
  middleware: ComposedMiddleware,
) {
  return async function (ctx: Context, next: () => Promise<void>) {
    const match = matcher(ctx.request.url.pathname);

    if (match) {
      if (ctx.request.method === method) {
        ctx.request.pathParams = (match.params as Record<string, string>) || {};

        await middleware(ctx);
      } else if (ctx.request.method === "OPTIONS" && handleOptions) {
        ctx.response.headers.append("Access-Control-Allow-Methods", method);
      }
    }

    await next();
  };
}

/** Options for a Router. */
export interface RouterOptions {
  /**
   * Holds the base path of the Router. @see {defaultOptions} for default. */
  basePath?: string;

  /**
   * Specifies whether the Router should handle OPTIONS requests.
   * @see {defaultOptions} for default.
   */
  handleOptions?: boolean;
}

/** Default options used for creating a router. */
export const defaultOptions = {
  basePath: "/",
  handleOptions: true,
};

/**
 * Used to handle routing and route specific middleware for a Lapi Application.
 */
export class Router {
  #basePath: string;
  #handleOptions: boolean;
  #middleware: Middleware[] = [];
  #composedMiddleware?: ComposedMiddleware;
  #routes: { method: Method; path: string }[] = [];

  constructor(options: RouterOptions = defaultOptions) {
    const opts = { ...defaultOptions, ...options };
    this.#basePath = opts.basePath;
    this.#handleOptions = opts.handleOptions;
  }

  /* Adds Middleware or a route to the router. */
  use(
    middleware1: Middleware,
    middleware2: Middleware,
    ...middlewares: Middleware[]
  ): Router;
  use(method: Method, path: string, ...middlewares: Middleware[]): Router;
  use(
    methodOrMiddleware: Method | Middleware,
    pathOrMiddleware: string | Middleware,
    ...middlewares: Middleware[]
  ): Router {
    if (typeof methodOrMiddleware === "function") {
      this.#middleware.push(methodOrMiddleware);
      this.#middleware.push(pathOrMiddleware as Middleware);
      this.#middleware.push(...middlewares);
    } else {
      const path = (this.#basePath + pathOrMiddleware).replaceAll(/\/+/g, "/");

      this.#routes.push({ method: methodOrMiddleware, path });
      this.#middleware.push(
        route(
          methodOrMiddleware,
          match(path),
          this.#handleOptions,
          compose(middlewares),
        ),
      );
    }

    return this;
  }

  /** Adds a get route to the router. */
  get(path: string, ...middlewares: Middleware[]): Router {
    return this.use("GET", path, ...middlewares);
  }

  /** Adds a post route to the router. */
  post(path: string, ...middlewares: Middleware[]): Router {
    return this.use("POST", path, ...middlewares);
  }

  /** Adds a put route to the router. */
  put(path: string, ...middlewares: Middleware[]): Router {
    return this.use("PUT", path, ...middlewares);
  }

  /** Adds a patch route to the router. */
  patch(path: string, ...middlewares: Middleware[]): Router {
    return this.use("PATCH", path, ...middlewares);
  }

  /** Adds a options route to the router. */
  options(path: string, ...middlewares: Middleware[]): Router {
    return this.use("OPTIONS", path, ...middlewares);
  }

  /** Adds a delete route to the router. */
  delete(path: string, ...middlewares: Middleware[]): Router {
    return this.use("DELETE", path, ...middlewares);
  }

  /** Adds a head route to the router. */
  head(path: string, ...middlewares: Middleware[]): Router {
    return this.use("HEAD", path, ...middlewares);
  }

  /** Adds a trace route to the router. */
  trace(path: string, ...middlewares: Middleware[]): Router {
    return this.use("TRACE", path, ...middlewares);
  }

  /** Returns the routes and Middleware for the Lapi Application to use. */
  routes() {
    if (!this.#composedMiddleware) {
      this.#composedMiddleware = compose(this.#middleware);
    }

    this.#routes.forEach(({ method, path }) =>
      console.log(`${method} ${path}`)
    );

    return this.#composedMiddleware;
  }
}
