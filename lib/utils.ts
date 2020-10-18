// Copyright 2020 Luke Shay. All rights reserved. MIT license.
/* @private */
/* @module lapi/types */
// deno-lint-ignore-file

/** Returns a id as a string. */
export function id(): string {
  return (Math.random().toString(36).substring(2, 6) + Date.now().toString(36))
    .toUpperCase();
}

/**
 * Get the raw type string of a value, e.g., [object Object].
 */
const _toString = Object.prototype.toString;

/** Checks if the given value is a string. */
export function isString(value: any): boolean {
  return _toString.call(value) === "[object String]";
}

/** Checks if the given value is an async function. */
export function isAsyncFunc(value: any): boolean {
  return _toString.call(value) === "[object AsyncFunction]";
}

/** Checks if the given value is a sync function. */
export function isSyncFunc(value: any): boolean {
  return _toString.call(value) === "[object Function]";
}

/** Checks if the given value is an async or sync function. */
export function isFunc(value: any): boolean {
  return isAsyncFunc(value) || isSyncFunc(value);
}

/** Checks if the given value is an object. */
export function isObject(value: any): boolean {
  return _toString.call(value) === "[object Object]";
}

/** Checks if the given value is a regular expression. */
export function isRegExp(value: any): boolean {
  return _toString.call(value) === "[object RegExp]";
}
