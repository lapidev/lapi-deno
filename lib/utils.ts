// Copyright 2020 Luke Shay. All rights reserved. MIT license.
/* @private */

/** Returns a id as a string. */
export function id(): string {
  return (Math.random().toString(36).substring(2, 6) + Date.now().toString(36)).toUpperCase();
}
