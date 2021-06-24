// Copyright 2020 Luke Shay. All rights reserved. MIT license.
/* @module lapi/response */

import { Status } from "./deps.ts";

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

export class Response {
  #body: Body;
  #headers = new Headers();
  #status = Status.OK;
  #handled = false;

  get body() {
    return this.#body;
  }

  get headers() {
    return this.#headers;
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

  get handled() {
    return this.#handled;
  }
}
