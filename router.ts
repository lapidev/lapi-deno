// Copyright 2020 Luke Shay. All rights reserved. MIT license.
/* @module lapi/router */
import { Middleware, compose } from "./middleware.ts";

export type Method = "POST" | "GET" | "DELETE" | "PUT" | "OPTIONS";

export class Router {
  #basePath: string;
  #middleware: Middleware[] = [];
  #composedMiddleware?: Middleware;

  constructor(basePath?: string) {
    this.#basePath = basePath ?? "/";
  }

  #getMiddleware() {
    if (!this.#composedMiddleware) {
      this.#composedMiddleware = compose(this.#middleware);
    }

    return this.#composedMiddleware;
  }

  middleware() {
    return this.#getMiddleware();
  }

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
      // create the method and patch handler.
      // add base path to this pa
    }

    return this;
  }
}
