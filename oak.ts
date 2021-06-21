/* This all comes from Oak which can be [found here](https://deno.land/x/oak). */

import { AsyncIterableReader } from "https://deno.land/x/oak@v7.5.0/async_iterable_reader.ts";
import { readerFromStreamReader } from "https://deno.land/x/oak@v7.5.0/deps.ts";
import {
  BODY_TYPES,
  isAsyncIterable,
  isHtml,
  isReader,
  Uint8ArrayTransformStream,
} from "https://deno.land/x/oak@v7.5.0/util.ts";

type Body =
  | string
  | number
  | bigint
  | boolean
  | symbol
  // deno-lint-ignore ban-types
  | object
  | undefined
  | null;
type BodyFunction = () => Body | Promise<Body>;

const encoder = new TextEncoder();

function toUint8Array(body: Body): Uint8Array {
  let bodyText: string;
  if (BODY_TYPES.includes(typeof body)) {
    bodyText = String(body);
  } else {
    bodyText = JSON.stringify(body);
  }
  return encoder.encode(bodyText);
}

export async function convertBodyToStdBody(
  body: Body | BodyFunction,
  type?: string | null,
): Promise<[Uint8Array | Deno.Reader | undefined, string | undefined | null]> {
  let result: Uint8Array | Deno.Reader | undefined;
  if (BODY_TYPES.includes(typeof body)) {
    const bodyText = String(body);
    result = encoder.encode(bodyText);
    type = type ?? (isHtml(bodyText) ? "text/html" : "text/plain");
  } else if (body instanceof Uint8Array || isReader(body)) {
    result = body;
  } else if (body instanceof ReadableStream) {
    result = readerFromStreamReader(
      body.pipeThrough(new Uint8ArrayTransformStream()).getReader(),
    );
  } else if (isAsyncIterable(body)) {
    result = new AsyncIterableReader(body, toUint8Array);
  } else if (body && typeof body === "object") {
    result = encoder.encode(JSON.stringify(body));
    type = type ?? "application/json";
  } else if (typeof body === "function") {
    const result = body.call(null);
    return convertBodyToStdBody(await result, type);
  } else if (body) {
    throw new TypeError("Response body was set but could not be converted.");
  }
  return [result, type];
}
