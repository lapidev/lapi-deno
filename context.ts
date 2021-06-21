// Copyright 2020 Luke Shay. All rights reserved. MIT license.
/* @module lapi/context */

import type { Response } from "./response.ts";
import type { Request } from "./request.ts";
import { Application } from "./application.ts";

export class Context {
  #request: Request;
  #response: Response;
  #application: Application;

  constructor(request: Request, response: Response, application: Application) {
    this.#request = request;
    this.#response = response;
    this.#application = application;
  }

  get request() {
    return this.#request;
  }

  get response() {
    return this.#response;
  }

  get host() {
    return this.#application.host;
  }

  get port() {
    return this.#application.port;
  }
}
