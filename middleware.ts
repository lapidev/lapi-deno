// Copyright 2020 Luke Shay. All rights reserved. MIT license.
/* @module lapi/middleware */

import type { Context } from "./context.ts";

/** A function to be used to process a Context. */
export interface Middleware {
  (context: Context, next: () => Promise<void>): Promise<void> | void;
}

export interface ComposedMiddleware {
  (context: Context): Promise<void> | void;
}

/**
 * Takes in an array of Middleware functions and composes it into a single
 * Middleware function. This should generally not be used.
 */
export function compose(middleware: Middleware[]): ComposedMiddleware {
  return function composedMiddleware(
    context: Context,
    next?: () => Promise<void>
  ): Promise<void> {
    let index = -1;

    async function dispatch(i: number): Promise<void> {
      if (i <= index) {
        throw new Error("next() called multiple times.");
      }

      index = i;

      let fn: Middleware | undefined = middleware[i];

      if (i === middleware.length) {
        fn = next;
      }

      if (!fn) {
        return;
      }

      await fn(context, dispatch.bind(null, i + 1));
    }

    return dispatch(0);
  };
}
