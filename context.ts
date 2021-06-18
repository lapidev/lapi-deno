// Copyright 2020 Luke Shay. All rights reserved. MIT license.
/* @module lapi/context */

import type { Response } from "./response.ts";
import type { Request } from "./request.ts";

export interface Context {
  request: Request;
  response: Response;
}
