// Copyright 2020 Luke Shay. All rights reserved. MIT license.
/* @module lapi/utils */
/* @private */

const BODY_TYPES = ["string", "number", "bigint", "boolean", "symbol"];

/** Determines if a string is HTML. */
export function isHtml(value: string) {
  return /^\s*<(?:!DOCTYPE|html|body)/i.test(value);
}

/** Determines if a value can be turned into a string. */
export function stringifyable(value: unknown) {
  return BODY_TYPES.includes(typeof value);
}

/** Determines if a the value is an instance of `Deno.Reader`. */
export function isReader(value: unknown): value is Deno.Reader {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Record<string, unknown>).read === "function"
  );
}

/** Determines if the value is an `Uint8Array`. */
export function isUint8Array(value: unknown): value is Uint8Array {
  return value instanceof Uint8Array;
}

/** Determines if the value is a `ReadableStream`. */
export function isReadableStream(value: unknown): value is ReadableStream {
  return value instanceof ReadableStream;
}

/** Determines if the value is an Async Iterables. */
// deno-lint-ignore no-explicit-any
export function isAsyncIterable(value: unknown): value is AsyncIterable<any> {
  return (
    typeof value === "object" &&
    value !== null &&
    Symbol.asyncIterator in value &&
    // deno-lint-ignore no-explicit-any
    typeof (value as any)[Symbol.asyncIterator] === "function"
  );
}

/** Determines if the value is an object. */
// deno-lint-ignore ban-types
export function isObject(value: unknown): value is Object {
  return typeof value === "object";
}

/** Determines if the value is an function. */
// deno-lint-ignore ban-types
export function isFunction(value: unknown): value is Function {
  return typeof value === "function";
}

/** Determines the current process is unstable by checking for 'serveHttp' on Deno. */
export function isUnstable() {
  return "serveHttp" in Deno;
}
