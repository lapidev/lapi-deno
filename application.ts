// Copyright 2020 Luke Shay. All rights reserved. MIT license.
/* @module lapi/application */

import { compose, ComposedMiddleware, Middleware } from "./middleware.ts";
import { HttpServer } from "./http_server.ts";
import { HttpServerNative } from "./http_server_native.ts";
import { HttpServerStd } from "./http_server_std.ts";
import { isUnstable } from "./utils.ts";
import { updateTypeAndGetBody } from "./response.ts";

/** Options for configuring an Application. */
export interface ApplicationOptions<T> {
  /**
   * Specifies the port to run on.
   *
   * @default 3000
   */
  port?: number;

  /** Specifies the host to listen to. */
  host?: string;

  /**
   * Selects the the type of HTTP server you want to use. If you want to run the
   * native HTTP server, you must use the '--unstable' flag. Lapi determines
   * this by see if it has been run with '--unstable'. If it has, the native
   * HTTP server will be used. Otherwise, the standard HTTP server is used.
   */
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
    this.#httpServer = server || isUnstable()
      ? (new HttpServerNative({
        port: port || 3000,
        host,
      }) as unknown as HttpServer<T>)
      : (new HttpServerStd({
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
      await this.#getComposedMiddleware()(ctx);

      const body = await updateTypeAndGetBody(ctx, renderer);

      await responder(ctx, body);
    }
  }
}
