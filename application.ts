// Copyright 2020 Luke Shay. All rights reserved. MIT license.
/* @module lapi/application */

import { compose, ComposedMiddleware, Middleware } from "./middleware.ts";
import { HttpServer } from "./http_server.ts";
import { StdHttpServer } from "./std_http_server.ts";

export interface ApplicationOptions<T> {
  port?: number;
  host?: string;
  server?: HttpServer<T>;
}

/**
 * Used to create an API. This handles starting the #server and sending
 * requests to the correct location.
 */
export class Application<T> {
  #middleware: Middleware[] = [];
  #composedMiddleware?: ComposedMiddleware;
  #port: number;
  #host?: string;
  #httpServer: HttpServer<T>;

  /** Constructs an Application. */
  constructor({ port, host, server }: ApplicationOptions<T> = {}) {
    this.#port = port || 3000;
    this.#host = host;
    this.#httpServer = server ||
      (new StdHttpServer() as unknown as HttpServer<T>);
  }

  get host() {
    return this.#host;
  }

  get port() {
    return this.#port;
  }

  /** Adds Middleware to the application. */
  use(midlewares: Middleware[]): Application<T>;
  use(...middlewares: Middleware[]): Application<T>;
  use(middlewareOrMiddlewares: Middleware | Middleware[]): Application<T> {
    this.#middleware.push(
      compose(
        typeof middlewareOrMiddlewares === "function"
          ? [middlewareOrMiddlewares]
          : middlewareOrMiddlewares,
      ),
    );

    return this;
  }

  #getComposedMiddleware() {
    if (!this.#composedMiddleware) {
      this.#composedMiddleware = compose(this.#middleware);
    }

    return this.#composedMiddleware;
  }

  /** Starts the HTTP server. */
  async start(): Promise<void> {
    await this.#httpServer.start({
      application: this,
      handler: this.#getComposedMiddleware(),
    });
  }
}
