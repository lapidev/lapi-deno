import { Context } from "./context.ts";
import { serve } from "./deps.ts";
import { HttpServer, HttpServerOpts, HttpServerParams } from "./http_server.ts";
import { StdRequest } from "./std_request.ts";
import { Response } from "./response.ts";
import { defaultStdRenderer, Renderer } from "./renderer.ts";

export type StdHttpResponse = Uint8Array | Deno.Reader | undefined;

export class StdHttpServer implements HttpServer<StdHttpResponse> {
  #renderer: Renderer<StdHttpResponse>;

  constructor({ renderer }: HttpServerOpts<StdHttpResponse> = {}) {
    this.#renderer = renderer || defaultStdRenderer;
  }

  get renderer() {
    return this.#renderer;
  }

  async start({ handler, application }: HttpServerParams<StdHttpResponse>) {
    const server = serve({
      hostname: application.host,
      port: application.port,
    });

    for await (const request of server) {
      const ctx = new Context(
        new StdRequest(
          request,
          `http://${application.host}:${application.port}`,
        ),
        new Response(),
        application.host,
        application.port,
      );

      await handler(ctx);

      const { body, type } = ctx.response.handled
        ? await this.#renderer(
          ctx.response.body as Body,
          ctx.response.headers.get("Content-type"),
        )
        : { body: undefined, type: undefined };

      if (type) {
        ctx.response.headers.set("Content-type", type);
      }

      if (!ctx.response.handled) {
        ctx.response.status = 404;
      }

      await request.respond({
        body,
        headers: ctx.response.headers,
        status: ctx.response.status,
      });
    }
  }
}
