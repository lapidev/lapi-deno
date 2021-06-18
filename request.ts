// Copyright 2020 Luke Shay. All rights reserved. MIT license.
/* @module lapi/request */

import type { ServerRequest } from "./deps.ts";

export class Request {
  #serverRequest: ServerRequest;

  constructor(serverRequest: ServerRequest) {
    this.#serverRequest = serverRequest;
  }

  get method() {
    return this.#serverRequest.method;
  }

  get url() {
    return this.#serverRequest.url;
  }

  get body() {
    return this.#serverRequest.body;
  }

  get headers() {
    return this.#serverRequest.headers;
  }

  get contentLength() {
    return this.#serverRequest.contentLength;
  }

  get proto() {
    return this.#serverRequest.proto;
  }

  get protoMinor() {
    return this.#serverRequest.protoMinor;
  }

  get protoMajor() {
    return this.#serverRequest.protoMajor;
  }
}
