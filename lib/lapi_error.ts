// Copyright 2020 Luke Shay. All rights reserved. MIT license.
/* @module lapi/lapi_error */

export class LapiError<T> extends Error {
  constructor(
    public message: string,
    public status: number,
    public path: string,
    public body?: T,
  ) {
    super(message);

    Object.defineProperty(this, "name", {
      get() {
        return "LapiError";
      },
    });
    Object.defineProperty(this, "status", {
      get() {
        return status;
      },
    });
    Object.defineProperty(this, "path", {
      get() {
        return path;
      },
    });

    Error.captureStackTrace(this, LapiError);
    return this;
  }
}
