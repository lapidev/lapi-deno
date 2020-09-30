// Copyright 2020 Luke Shay. All rights reserved. MIT license.
/* @module lapi/request */

import type { ServerRequest, Response } from "../deps.ts";

export type QueryStrings = any;

/** Class that stores request information and sends responses. */
export class Request {
  url: URL;
  status = 200;
  headers = new Headers();
  body?: string;

  /** Creates a Request. */
  constructor(private serverRequest: ServerRequest) {
    this.url = new URL(`http://fakeurl${serverRequest.url}`);
  }

  /** Sets the body to the passed in object and the content type to application/json. */
  json(body: any): Request {
    this.body = JSON.stringify(body);
    this.headers.set("Content-type", "application/json");
    return this;
  }

  /** Sends a response. */
  send(response?: Response): void {
    this.serverRequest.respond(
      response ||
        { body: this.body, status: this.status, headers: this.headers },
    );
  }

  /** Sets a header. */
  setHeader(name: string, value: string): Request {
    this.headers.set(name, value);
    return this;
  }

  /** Gets a header. */
  getHeader(name: string): string | null {
    return this.headers.get(name);
  }

  get method(): string {
    return this.serverRequest.method;
  }
}
