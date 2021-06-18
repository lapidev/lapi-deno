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
  body: Body;
  headers = new Headers();
  status = Status.OK;
}
