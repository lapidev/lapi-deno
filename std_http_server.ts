import { Context } from "./context.ts";
import { Server } from "./deps.ts";
import {
  HttpServer,
  HttpServerIteratorResult,
  HttpServerIteratorStarter,
  HttpServerOpts,
} from "./http_server.ts";
import { StdRequest } from "./std_request.ts";
import { Response, updateTypeAndGetBody } from "./response.ts";
import { defaultStdRenderer, Renderer } from "./renderer.ts";

export type StdHttpResponse = Uint8Array | Deno.Reader | undefined;

export class StdHttpServer implements HttpServer<StdHttpResponse> {
  #renderer: Renderer<StdHttpResponse>;
  #host?: string;
  #port: number;

  constructor(
    { renderer, host, port }: HttpServerOpts<StdHttpResponse> = { port: 3000 }
  ) {
    this.#renderer = renderer || defaultStdRenderer;
    this.#host = host;
    this.#port = port;
  }

  [Symbol.asyncIterator](): AsyncIterableIterator<
    HttpServerIteratorResult<StdHttpResponse>
  > {
    const start: HttpServerIteratorStarter<StdHttpResponse> = (controller) => {
      const server = this;

      async function accept() {
        const listener = new Server(
          Deno.listen({
            hostname: server.#host,
            port: server.#port,
          })
        );

        for await (const request of listener) {
          const ctx = new Context(
            new StdRequest(request, `http://${server.#host}:${server.#port}`),
            new Response(),
            server.#host,
            server.#port
          );

          async function responder(ctx: Context, body: StdHttpResponse) {
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
      HttpServerIteratorResult<StdHttpResponse>
    >({ start });

    return stream[Symbol.asyncIterator]();
  }
}
