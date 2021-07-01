// Copyright 2020 Luke Shay. All rights reserved. MIT license.
/* @module lapi/renderer_native */

import { convertBodyToBodyInit } from "./oak.ts";
import { Rendered } from "./renderer.ts";
import { Body, BodyFunction } from "./response.ts";

export async function defaultNativeRenderer(
  body: Body | BodyFunction,
  type?: string | null,
): Promise<Rendered<BodyInit>> {
  const [resultBody, resultType] = await convertBodyToBodyInit(body, type);
  return { body: resultBody, type: resultType };
}
