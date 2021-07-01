// Copyright 2020 Luke Shay. All rights reserved. MIT license.
/* @module lapi/renderer_std */

import { convertBodyToStdBody } from "./oak.ts";
import { Rendered } from "./renderer.ts";
import { Body, BodyFunction } from "./response.ts";

export async function defaultStdRenderer(
  body: Body | BodyFunction,
  type?: string | null,
): Promise<Rendered<Uint8Array | Deno.Reader>> {
  const [resultBody, resultType] = await convertBodyToStdBody(body, type);
  return { body: resultBody, type: resultType };
}
