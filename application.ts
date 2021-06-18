// Copyright 2020 Luke Shay. All rights reserved. MIT license.
/* @module lapi/application */

import { serve, Server, ServerRequest } from "./deps.ts";
import { Middleware, compose } from "./middleware.ts";
import { Response } from "./response.ts";
import { Request } from "./request.ts";
import { convertBodyToStdBody } from "./oak.ts";

export interface ApplicationOptions {
  port?: number;
  host?: string;
  renderer?: Renderer;
}

export interface Rendered {
  body?: Uint8Array | Deno.Reader;
  type?: string | null;
}

export interface Renderer {
  (body: Body, type?: string | null): Promise<Rendered> | Rendered;
}

async function defaultRenderer(
  body: Body,
  type?: string | null
): Promise<Rendered> {
  const [resultBody, resultType] = await convertBodyToStdBody(body, type);
  return { body: resultBody, type: resultType };
}

/** Class used to create an API. This handles starting the #server and sending requests to the correct location. */
export class Application {
  #middleware: Middleware[] = [];
  #composedMiddleware?: Middleware;
  #port = 3000;
  #host = "0.0.0.0";
  #renderer: Renderer = defaultRenderer;

  #server?: Server;

  /** Constructs an Application. */
  constructor(options?: ApplicationOptions) {
    if (options) {
      const { port, host, renderer } = options;

      this.#port = port || 3000;
      this.#host = host || "0.0.0.0";
      this.#renderer = renderer || defaultRenderer;
    }
  }

  use(...middleware: Middleware[]): Application {
    this.#middleware.push(compose(middleware));

    return this;
  }

  #getComposedMiddleware() {
    if (!this.#composedMiddleware) {
      this.#composedMiddleware = compose(this.#middleware);
    }

    return this.#composedMiddleware;
  }

  /**
   * Handles the given request.
   *
   * @throws {LapiError} if the route is not found.
   */
  async #handleRequest(request: ServerRequest): Promise<void> {
    const ctx = {
      response: new Response(),
      request: new Request(request),
    };
    await this.#getComposedMiddleware()(ctx);

    const { body, type } = await this.#renderer(
      ctx.response.body as any,
      ctx.response.headers.get("Content-type")
    );

    if (type) {
      ctx.response.headers.set("Content-type", type);
    }

    await request.respond({
      body,
      headers: ctx.response.headers,
      status: ctx.response.status,
    });
  }

  /** Starts the HTTP #server. */
  async start(): Promise<void> {
    this.#server = serve({ hostname: this.#host, port: this.#port });

    for await (const serverRequest of this.#server) {
      this.#handleRequest(serverRequest);
    }
  }
}
