// Copyright 2020 Luke Shay. All rights reserved. MIT license.
/* @module lapi/http_server */

import { ComposedMiddleware } from "./middleware.ts";
import { Application } from "./application.ts";
import { Renderer } from "./renderer.ts";
import { Context } from "./context.ts";

export type HttpServerIteratorStarter<T> =
  ReadableStreamDefaultControllerCallback<
    HttpServerIteratorResult<T>
  >;

export type HttpServerIteratorController<T> = ReadableStreamDefaultController<
  HttpServerIteratorResult<T>
>;

export interface HttpServerParams<T> {
  handler: ComposedMiddleware;
  application: Application<T>;
}

export interface HttpServerOpts<T> {
  renderer?: Renderer<T>;
  host?: string;
  port: number;
}

export interface HttpServerIteratorResult<T> {
  ctx: Context;
  renderer: Renderer<T>;
  responder: (ctx: Context, body?: T) => Promise<void>;
}

export declare class HttpServer<T>
  implements AsyncIterable<HttpServerIteratorResult<T>> {
  constructor(opts?: HttpServerOpts<T>);

  [Symbol.asyncIterator](): AsyncIterableIterator<HttpServerIteratorResult<T>>;
}
