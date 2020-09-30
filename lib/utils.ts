// This source code is base off https://github.com/vuejs/vue/blob/master/src/shared/util.js. All credit goes to the Vue.js team
// deno-lint-ignore-file no-explicit-any

/** Checks if the val is a primitive. */
export function isPrimitive(value: any): boolean {
  return (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "symbol" ||
    typeof value === "boolean"
  );
}

/** Checks if the val is an object. */
export function isObject(val: any | null): boolean {
  return val !== null && typeof val === "object";
}

/** Get the raw type string of a value, e.g., [object Object]. */
const _toString = Object.prototype.toString;

/** Returns the raw type of the val. */
export function toRawType(val: any): string {
  return _toString.call(val).slice(8, -1);
}

/** Strict object type check. Only returns true for plain JavaScript objects. */
export function isPlainObject(obj: any): boolean {
  return _toString.call(obj) === "[object Object]";
}

/** Checks if the val is a RegExp. */
export function isRegExp(val: any): boolean {
  return _toString.call(val) === "[object RegExp]";
}

/** Check if val is a valid array index. */
export function isValidArrayIndex(val: any): boolean {
  const n = parseFloat(String(val));
  return n >= 0 && Math.floor(n) === n && isFinite(val);
}

/** Checks if val is a function. */
export function isFunc(val: any): boolean {
  return typeof val === "function";
}

/** Checks if val is a promise. */
export function isPromise(val: any): boolean {
  return val && isFunc(val.then) && isFunc(val.catch);
}

/** Convert a value to a string. */
export function toString(val: any): string {
  return !val
    ? ""
    : Array.isArray(val) || (isPlainObject(val) && val.toString === _toString)
    ? JSON.stringify(val, null, 2)
    : String(val);
}

/** Convert an input value to a number for persistence. If the conversion fails, return original string. */
export function toNumber(val: string): number | string {
  const n = parseFloat(val);
  return isNaN(n) ? val : n;
}
