// Copyright 2020 Luke Shay. All rights reserved. MIT license.
/* @module lapi/context */

import type { Response } from "./response.ts";
import type { Request } from "./request.ts";
import { Application } from "./application.ts";

export class Context {
  #request: Request;
  #response: Response;
  #host?: String;
  #port: number;

  constructor(request: Request, response: Response, host: string | undefined, port: number) {
    this.#request = request;
    this.#response = response;
    this.#host = host;
    this.#port = port;
  }

  get request() {
    return this.#request;
  }

  get response() {
    return this.#response;
  }

  get host() {
    return this.#host;
  }

  get port() {
    return this.#port;
  }
}
