// Copyright 2020 Luke Shay. All rights reserved. MIT license.
/* @module lapi/response */

import { Context } from "./context.ts";
import { Status } from "./deps.ts";
import { Renderer } from "./renderer.ts";

export type Body =
  | string
  | number
  | bigint
  | boolean
  | symbol
  // deno-lint-ignore ban-types
  | object
  | undefined
  | null;
export type BodyFunction = () => Body | Promise<Body>;

export class Response {
  #body: Body | BodyFunction;
  #headers = new Headers();
  #status = Status.OK;
  #handled = false;

  get body() {
    return this.#body;
  }

  set body(body: Body) {
    this.#handled = true;
    this.#body = body;
  }

  get status() {
    return this.#status;
  }

  set status(status: Status) {
    this.#handled = true;
    this.#status = status;
  }

  get headers() {
    return this.#headers;
  }

  get handled() {
    return this.#handled;
  }
}

/** Updates the Content-Type header and returns the rendered body. */
export async function updateTypeAndGetBody<T>(
  ctx: Context,
  renderer: Renderer<T>
) {
  const { body, type } = ctx.response.handled
    ? await renderer(
        ctx.response.body as Body,
        ctx.response.headers.get("Content-type")
      )
    : { body: undefined, type: undefined };

  if (type) {
    ctx.response.headers.set("Content-type", type);
  }

  if (!ctx.response.handled) {
    ctx.response.status = 404;
  }

  return body;
}
