// Copyright 2020 Luke Shay. All rights reserved. MIT license.
/* @module lapi/lapi_request */

import { Cookie, Response, ServerRequest, setCookie } from "../deps.ts";
import { Logger } from "./logger.ts";
import { ContentType } from "./content_type.ts";
import { Header } from "./header.ts";

/** Class that stores response information. */
export class LapiResponse {
  /** Stores the URL of the request. */
  url: string;

  /** Stores the status that will be sent in the response. */
  status = 200;

  /** Logger used to log messages to the console. */
  logger: Logger;

  /** Headers that will be sent in the response.. */
  private _headers = new Headers();

  /** Body that will be sent in the response. */
  private _body?: string;

  /** Cookies that will be sent in the response. */
  private _cookies: Cookie[] = [];

  /** Creates a Request. */
  constructor(
    public id: string,
    private serverRequest: ServerRequest,
  ) {
    this.url = this.serverRequest.url;
    this.logger = new Logger(this.id);
  }

  /** Sets the body to the passed in object and the content type to application/json. */
  json(body: Record<string, unknown>): LapiResponse {
    this._body = JSON.stringify(body);
    this.setHeader(Header.ContentType, ContentType.ApplicationJson);
    return this;
  }

  /** Sets the body to the passed in string and the content type to application/xml. */
  xml(body: string): LapiResponse {
    this._body = body;
    this.setHeader(Header.ContentType, ContentType.ApplicationXml);
    return this;
  }

  /** Sets the body to the passed in string and the content type to text/plain. */
  text(body: string): LapiResponse {
    this._body = body;
    this.setHeader(Header.ContentType, ContentType.TextPlain);
    return this;
  }

  /** Sets the body to the passed in string and the content type to text/html. */
  html(body: string): LapiResponse {
    this._body = body;
    this.setHeader(Header.ContentType, ContentType.TextHtml);
    return this;
  }

  /** Generates and returns the response. */
  getResponse(response?: Response): Response {
    if (response?.headers && this._headers) {
      response.headers.forEach((value, key) => this._headers.set(key, value));
    }

    const serverResponse = {
      body: this._body,
      status: this.status,
      ...response,
      headers: this._headers,
    };

    this._cookies.forEach((cookie: Cookie): void =>
      setCookie(serverResponse, cookie)
    );

    return serverResponse;
  }

  /** Sends a response. */
  send(response?: Response): void {
    this.serverRequest.respond(this.getResponse(response));
  }

  /** Sets a header. */
  setHeader(name: string, value: string): LapiResponse {
    this._headers.set(name, value);
    return this;
  }

  /** Gets a header. */
  getHeader(name: string): string | null {
    return this._headers.get(name);
  }

  /** Sets the status of the response. */
  setStatus(status: number): LapiResponse {
    this.status = status;
    return this;
  }

  /** Sets a cookie for the response. */
  setCookie(cookie: Cookie): LapiResponse {
    this._cookies.push(cookie);
    return this;
  }
}
