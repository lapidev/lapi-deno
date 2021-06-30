import { Body, BodyFunction } from "./response.ts";
import { convertBodyToStdBody, convertBodyToBodyInit } from "./oak.ts";

export interface Rendered<T> {
  body?: T;
  type?: string | null;
}

export interface Renderer<T> {
  (body: Body, type?: string | null): Promise<Rendered<T>> | Rendered<T>;
}

export async function defaultStdRenderer(
  body: Body | BodyFunction,
  type?: string | null
): Promise<Rendered<Uint8Array | Deno.Reader>> {
  const [resultBody, resultType] = await convertBodyToStdBody(body, type);
  return { body: resultBody, type: resultType };
}
export async function defaultNativeRenderer(
  body: Body | BodyFunction,
  type?: string | null
): Promise<Rendered<BodyInit>> {
  const [resultBody, resultType] = await convertBodyToBodyInit(body, type);
  return { body: resultBody, type: resultType };
}
