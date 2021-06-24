// Copyright 2020 Luke Shay. All rights reserved. MIT license.
/* @module lapi/middleware/router */

import { compose, ComposedMiddleware, Middleware } from "../middleware.ts";
import { Context } from "../context.ts";

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
  path: RegExp,
  handleOptions: boolean,
  middleware: ComposedMiddleware,
) {
  return async function (ctx: Context, next: () => Promise<void>) {
    if (path.test(ctx.request.url.pathname)) {
      if (ctx.request.method === method) {
        ctx.request.pathParams = path.exec(ctx.request.url.pathname)?.groups ||
          {};

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
   * Holds the base path of the Router.
   *
   * @default "/"
   */
  basePath?: string;

  /**
   * Specifies whether the Router should handle OPTIONS requests.
   *
   * @default true
   */
  handleOptions?: boolean;
}

/**
 * Used to handle routing and route specific middleware for a Lapi Application.
 */
export class Router {
  #basePath: string;
  #handleOptions: boolean;
  #middleware: Middleware[] = [];
  #composedMiddleware?: ComposedMiddleware;
  #routes: { method: Method; path: string }[] = [];

  constructor({ basePath, handleOptions }: RouterOptions = {}) {
    this.#basePath = basePath ?? "/";
    this.#handleOptions = handleOptions ?? true;
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
          new RegExp(
            `^${
              path
                .replaceAll(".", "\\.")
                .replaceAll(/<([a-zA-Z]+)>/g, "(?<$1>[^/]+)")
            }$`,
          ),
          this.#handleOptions,
          compose(middlewares),
        ),
      );
    }

    return this;
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
