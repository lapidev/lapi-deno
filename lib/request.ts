// Copyright 2020 Luke Shay. All rights reserved. MIT license.
/* @module lapi/request */

import type { ServerRequest, Response } from "../deps.ts";
import { Logger } from "./logger.ts";

/** Class that stores request information and sends responses. */
export class Request {
  url: Readonly<string>;
  status = 200;
  logger: Logger;
  headers = new Headers();
  responseBody?: string;

  /** Creates a Request. */
  constructor(
    private id: string,
    private serverRequest: ServerRequest,
    public body: string,
  ) {
    this.url = this.serverRequest.url;
    this.logger = new Logger(this.id);
  }

  /** Sets the body to the passed in object and the content type to application/json. */
  json(body: Record<string, unknown>): Request {
    this.responseBody = JSON.stringify(body);
    this.setHeader("Content-type", "application/json");
    return this;
  }

  /** Sets the body to the passed in string and the content type to application/xml. */
  xml(body: string): Request {
    this.responseBody = body;
    this.setHeader("Content-type", "application/xml");
    return this;
  }

  /** Sends a response. */
  send(response?: Response): void {
    this.serverRequest.respond(
      response ||
        { body: this.responseBody, status: this.status, headers: this.headers },
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

  /** Sets the status of the response. */
  setStatus(status: number): Request {
    this.status = status;
    return this;
  }

  get method(): string {
    return this.serverRequest.method;
  }

  get queries(): URLSearchParams {
    return new URL(`http://fakeurl${this.url}`).searchParams;
  }
}
