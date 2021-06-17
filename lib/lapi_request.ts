// Copyright 2020 Luke Shay. All rights reserved. MIT license.
/* @module lapi/lapi_request */

import { getCookies, ServerRequest } from "../deps.ts";
import { Logger } from "./logger.ts";

export type PathParameters = { [index: string]: string | undefined };
export type QueryStrings = { [index: string]: string | undefined };

/** Class that stores request information. */
export class LapiRequest {
  private _url: string;

  private _logger: Logger;

  private _params?: PathParameters;

  private _queries?: QueryStrings;

  private _body?: string;

  /** Creates a Request. */
  constructor(
    private id: string,
    private serverRequest: ServerRequest,
    private pathRegExp: RegExp,
    body: string,
  ) {
    this._body = body;
    this._url = this.serverRequest.url;
    this._logger = new Logger(this.id);
  }

  get params() {
    if (!this._params) {
      this._params = this.pathRegExp.exec(this.url)?.groups || {};
    }
    return this._params;
  }

  get queries() {
    if (!this._queries) {
      this._queries = {};

      const { searchParams } = new URL(`http://fakeurl${this.url}`);
      searchParams.forEach((value, key) => {
        if (this._queries) this._queries[key] = value;
      });
    }

    return this._queries;
  }

  get method() {
    return this.serverRequest.method;
  }

  get logger() {
    return this._logger;
  }

  get url() {
    return this._url;
  }

  get body() {
    return this._body;
  }

  get cookies(): Record<string, string> {
    return getCookies(this.serverRequest);
  }
}
