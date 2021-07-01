// Copyright 2020 Luke Shay. All rights reserved. MIT license.
/* @module lapi/request_native */

import { Request as HttpRequest } from "./request.ts";
import { readerFromStreamReader } from "./deps.ts";

export class RequestNative implements HttpRequest {
  #request: Request;
  #pathParams: Record<string, string> = {};
  #pathParamsSet = false;

  constructor(requestParams: Request) {
    this.#request = requestParams;
  }

  get method() {
    return this.#request.method;
  }

  get url() {
    return new URL(this.#request.url);
  }

  get body() {
    return this.#request.body
      ? readerFromStreamReader(this.#request.body.getReader())
      : null;
  }

  get headers() {
    return this.#request.headers;
  }

  get proto() {
    return "";
  }

  set pathParams(pathParams: Record<string, string>) {
    if (!this.#pathParamsSet) {
      this.#pathParams = pathParams;
    }
  }

  get pathParams() {
    return this.#pathParams;
  }
}
