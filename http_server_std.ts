// Copyright 2020 Luke Shay. All rights reserved. MIT license.
/* @module lapi/http_server_std */

import { Context } from "./context.ts";
import { Server } from "./deps.ts";
import {
  HttpServer,
  HttpServerIteratorResult,
  HttpServerIteratorStarter,
  HttpServerOpts,
} from "./http_server.ts";
import { RequestStd } from "./request_std.ts";
import { Response } from "./response.ts";
import { Renderer } from "./renderer.ts";
import { defaultStdRenderer } from "./renderer_std.ts";

export type HttpServerStdResponse = Uint8Array | Deno.Reader | undefined;

export class HttpServerStd implements HttpServer<HttpServerStdResponse> {
  #renderer: Renderer<HttpServerStdResponse>;
  #host?: string;
  #port: number;

  constructor(
    { renderer, host, port }: HttpServerOpts<HttpServerStdResponse> = {
      port: 3000,
    },
  ) {
    this.#renderer = renderer || defaultStdRenderer;
    this.#host = host;
    this.#port = port;
  }

  [Symbol.asyncIterator](): AsyncIterableIterator<
    HttpServerIteratorResult<HttpServerStdResponse>
  > {
    const start: HttpServerIteratorStarter<HttpServerStdResponse> = (
      controller,
    ) => {
      // deno-lint-ignore no-this-alias
      const server = this;

      async function accept() {
        const listener = new Server(
          Deno.listen({
            hostname: server.#host,
            port: server.#port,
          }),
        );

        for await (const request of listener) {
          const ctx = new Context(
            new RequestStd(request, `http://${server.#host}:${server.#port}`),
            new Response(),
            server.#host,
            server.#port,
          );

          // deno-lint-ignore no-inner-declarations
          async function responder(ctx: Context, body: HttpServerStdResponse) {
            await request.respond({
              body,
              headers: ctx.response.headers,
              status: ctx.response.status,
            });
          }

          controller.enqueue({ ctx, responder, renderer: server.#renderer });
        }
      }

      accept();
    };

    const stream = new ReadableStream<
      HttpServerIteratorResult<HttpServerStdResponse>
    >({ start });

    return stream[Symbol.asyncIterator]();
  }
}
