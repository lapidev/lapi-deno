import { Context } from "./context.ts";
import {
  HttpServer,
  HttpServerIteratorController,
  HttpServerIteratorResult,
  HttpServerIteratorStarter,
  HttpServerOpts,
} from "./http_server.ts";
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
  #host?: string;
  #port: number;

  constructor(
    { renderer, host, port }: HttpServerOpts<BodyInit> = { port: 3000 },
  ) {
    this.#renderer = renderer || defaultNativeRenderer;
    this.#host = host;
    this.#port = port;
  }

  async #serve(
    conn: Deno.Conn,
    controller: HttpServerIteratorController<BodyInit>,
  ) {
    const httpConn = serveHttp(conn);
    const server = this;

    while (true) {
      let requestEvent: RequestEvent | null = null;

      try {
        requestEvent = await httpConn.nextRequest();
      } catch {
        return;
      }

      if (!requestEvent) return;

      const ctx = new Context(
        new NativeRequest(requestEvent.request),
        new HttpResponse(),
        this.#host,
        this.#port,
      );

      async function responder(ctx: Context, body?: BodyInit) {
        requestEvent?.respondWith(
          new Response(body, {
            status: ctx.response.status,
            headers: ctx.response.headers,
          }),
        );
      }

      controller.enqueue({ ctx, responder, renderer: server.#renderer });
    }
  }

  [Symbol.asyncIterator](): AsyncIterableIterator<
    HttpServerIteratorResult<BodyInit>
  > {
    const start: HttpServerIteratorStarter<BodyInit> = (controller) => {
      const server = this;

      async function accept() {
        const listener = Deno.listen({
          hostname: server.#host,
          port: server.#port,
        });

        while (true) {
          const conn = await listener.accept();
          server.#serve(conn, controller);
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
