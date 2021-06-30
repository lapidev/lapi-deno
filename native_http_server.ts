import { Context } from "./context.ts";
import { HttpServer, HttpServerParams, HttpServerOpts } from "./http_server.ts";
import { NativeRequest } from "./native_request.ts";
import { Response as HttpResponse, updateTypeAndGetBody } from "./response.ts";
import { Renderer, defaultNativeRenderer } from "./renderer.ts";

export class NativeHttpServer implements HttpServer<BodyInit> {
  #renderer: Renderer<BodyInit>;

  constructor({ renderer }: HttpServerOpts<BodyInit> = {}) {
    this.#renderer = renderer || defaultNativeRenderer;
  }

  get renderer() {
    return this.#renderer;
  }

  async #serve(
    conn: Deno.Conn,
    { application, handler }: HttpServerParams<BodyInit>
  ) {
    const httpConn = Deno.serveHttp(conn);

    while (true) {
      let requestEvent: Deno.RequestEvent | null = null;

      try {
        requestEvent = await httpConn.nextRequest();
      } catch (e) {
        console.log(e.message);
        break;
      }

      if (!requestEvent) break;

      const ctx = new Context(
        new NativeRequest(requestEvent.request),
        new HttpResponse(),
        application.host,
        application.port
      );

      await handler(ctx);

      const body = await updateTypeAndGetBody(ctx, this.#renderer);

      requestEvent.respondWith(
        new Response(body, {
          status: ctx.response.status,
          headers: ctx.response.headers,
        })
      );
    }
  }

  async start(params: HttpServerParams<BodyInit>) {
    const listener = Deno.listen({
      hostname: params.application.host,
      port: params.application.port,
    });

    while (true) {
      const conn = await listener.accept();
      this.#serve(conn, params);
    }
  }
}
