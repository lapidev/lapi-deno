// Copyright 2020 Luke Shay. All rights reserved. MIT license.
/* @module lapi/renderer */

import { Body } from "./response.ts";

export interface Rendered<T> {
  body?: T;
  type?: string | null;
}

export interface Renderer<T> {
  (body: Body, type?: string | null): Promise<Rendered<T>> | Rendered<T>;
}
