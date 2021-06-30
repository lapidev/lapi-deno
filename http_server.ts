import { ComposedMiddleware } from "./middleware.ts";
import { Application } from "./application.ts";
import { Renderer } from "./renderer.ts";

export interface HttpServerParams<T> {
  handler: ComposedMiddleware;
  application: Application<T>;
}

export interface HttpServerOpts<T> {
  renderer?: Renderer<T>;
}

export declare class HttpServer<T> {
  constructor(opts?: HttpServerOpts<T>);
  start(params: HttpServerParams<T>): Promise<void>;
  readonly renderer: Renderer<T>;
}
