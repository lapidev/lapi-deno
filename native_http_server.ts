import { Context } from "./context.ts";
import { HttpServer, HttpServerOpts, HttpServerParams } from "./http_server.ts";
import { NativeRequest } from "./native_request.ts";
import { Response as HttpResponse, updateTypeAndGetBody } from "./response.ts";
import { defaultNativeRenderer, Renderer } from "./renderer.ts";

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
  if (!("serveHttp" in Deno)) {
    throw new Error("'--unstable' flag is required for native http server");
  }
}

function serveHttp(conn: Deno.Conn) {
  assertUnstable();

  // deno-lint-ignore no-explicit-any
  return (Deno as any).serveHttp(conn) as HttpConn;
}

export class NativeHttpServer implements HttpServer<BodyInit> {
  #renderer: Renderer<BodyInit>;

  constructor({ renderer }: HttpServerOpts<BodyInit> = {}) {
    assertUnstable();

    this.#renderer = renderer || defaultNativeRenderer;
  }

  get renderer() {
    return this.#renderer;
  }

  async #serve(
    conn: Deno.Conn,
    { application, handler }: HttpServerParams<BodyInit>,
  ) {
    const httpConn = serveHttp(conn);

    while (true) {
      let requestEvent: RequestEvent | null = null;

      try {
        requestEvent = await httpConn.nextRequest();
      } catch {
        break;
      }

      if (!requestEvent) break;

      const ctx = new Context(
        new NativeRequest(requestEvent.request),
        new HttpResponse(),
        application.host,
        application.port,
      );

      await handler(ctx);

      const body = await updateTypeAndGetBody(ctx, this.#renderer);

      requestEvent.respondWith(
        new Response(body, {
          status: ctx.response.status,
          headers: ctx.response.headers,
        }),
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
