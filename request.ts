// Copyright 2020 Luke Shay. All rights reserved. MIT license.
/* @module lapi/request */

export interface RequestParams {
  method: string;
  url: string;
  body: Deno.Reader;
  domain: string;
  contentLength: number | null | undefined;
  headers: Headers;
  proto: string;
  protoMinor: number;
  protoMajor: number;
}

export interface Request {
  readonly method: string;
  readonly url: URL;
  readonly body: Deno.Reader | null;
  readonly headers: Headers;
  readonly proto: string;
  pathParams: Record<string, string>;
}
