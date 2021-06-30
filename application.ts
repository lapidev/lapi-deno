// Copyright 2020 Luke Shay. All rights reserved. MIT license.
/* @module lapi/application */

import { compose, ComposedMiddleware, Middleware } from "./middleware.ts";
import { HttpServer } from "./http_server.ts";
import { StdHttpServer } from "./std_http_server.ts";
import { updateTypeAndGetBody } from "./response.ts";

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
  #httpServer: HttpServer<T>;

  /** Constructs an Application. */
  constructor({ port, host, server }: ApplicationOptions<T> = {}) {
    this.#httpServer = server ||
      (new StdHttpServer({
        port: port || 3000,
        host,
      }) as unknown as HttpServer<T>);
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
    for await (const { ctx, responder, renderer } of this.#httpServer) {
      this.#getComposedMiddleware()(ctx);

      const body = await updateTypeAndGetBody(ctx, renderer);

      await responder(ctx, body);
    }
  }
}
