// Copyright 2020 Luke Shay. All rights reserved. MIT license.
/* @module lapi/http_server_native */

import { Context } from "./context.ts";
import {
  HttpServer,
  HttpServerIteratorController,
  HttpServerIteratorResult,
  HttpServerIteratorStarter,
  HttpServerOpts,
} from "./http_server.ts";
import { RequestNative } from "./request_native.ts";
import { Response as HttpResponse } from "./response.ts";
import { Renderer } from "./renderer.ts";
import { defaultNativeRenderer } from "./renderer_native.ts";
import { isUnstable } from "./utils.ts";

export interface RequestEvent {
  readonly request: Request;
  respondWith(r: Response | Promise<Response>): Promise<void>;
}

export interface HttpConn extends AsyncIterable<RequestEvent> {
  readonly rid: number;

  nextRequest(): Promise<RequestEvent | null>;
  close(): void;
}

function assertUnstable() {
  if (!isUnstable()) {
    throw new Error("'--unstable' flag is required for native http server");
  }
}

function serveHttp(conn: Deno.Conn) {
  assertUnstable();

  // deno-lint-ignore no-explicit-any
  return (Deno as any).serveHttp(conn) as HttpConn;
}

export class HttpServerNative implements HttpServer<BodyInit> {
  #renderer: Renderer<BodyInit>;
  #host?: string;
  #port: number;

  constructor(
    { renderer, host, port }: HttpServerOpts<BodyInit> = { port: 3000 },
  ) {
    assertUnstable();

    this.#renderer = renderer || defaultNativeRenderer;
    this.#host = host;
    this.#port = port;
  }

  static #responder(requestEvent: RequestEvent) {
    return async function responder(ctx: Context, body?: BodyInit) {
      await requestEvent.respondWith(
        new Response(body, {
          status: ctx.response.status,
          headers: ctx.response.headers,
        }),
      );
    };
  }

  async #serve(
    conn: Deno.Conn,
    controller: HttpServerIteratorController<BodyInit>,
  ) {
    const httpConn = serveHttp(conn);

    while (true) {
      let requestEvent: RequestEvent | null = null;

      try {
        requestEvent = await httpConn.nextRequest();
      } catch {
        return;
      }

      if (!requestEvent) return;

      const ctx = new Context(
        new RequestNative(requestEvent.request),
        new HttpResponse(),
        this.#host,
        this.#port,
      );

      controller.enqueue({
        ctx,
        responder: HttpServerNative.#responder(requestEvent),
        renderer: this.#renderer,
      });
    }
  }

  [Symbol.asyncIterator](): AsyncIterableIterator<
    HttpServerIteratorResult<BodyInit>
  > {
    const start: HttpServerIteratorStarter<BodyInit> = (controller) => {

      const accept = async () => {
        const listener = Deno.listen({
          hostname: this.#host,
          port: this.#port,
        });

        while (true) {
          const conn = await listener.accept();
          this.#serve(conn, controller);
        }
      }

      accept();
    };

    const stream = new ReadableStream<HttpServerIteratorResult<BodyInit>>({
      start,
    });

    return stream[Symbol.asyncIterator]();
  }
}
