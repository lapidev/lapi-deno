// Copyright 2020 Luke Shay. All rights reserved. MIT license.
/* @module lapi/lapi_base */

import {
  LapiRoute,
  RequestHandler,
  RequestMethod,
  Route,
} from "./lapi_route.ts";
import type { LapiRequest } from "./lapi_request.ts";
import { isRegExp } from "./utils.ts";
import type { StrOrRegExp } from "./types.ts";
import type { LapiResponse } from "./lapi_response.ts";
import type { ServerRequest } from "../deps.ts";

export type Middleware = (
  req: LapiRequest,
  res: LapiResponse,
) => Promise<void> | void;

export interface LapiBaseOptions {
  middlewares?: Middleware[];
  routes?: Route[];
  timer?: boolean;
}

/** Base class to be used if you need a class that supports middlewares and routes. */
export class LapiBase {
  middlewares: Middleware[];
  routes: LapiRoute[];
  timer = false;

  /** Constructs a LapiBase class */
  constructor(options?: LapiBaseOptions) {
    this.middlewares = options?.middlewares || [];
    this.routes = options?.routes?.map(LapiRoute.FromRoute) || [];
    this.timer = options?.timer || false;
  }

  /** Adds a request handler for the given method and path. 
   * 
   * @throws {Error} - If the parameters are invalid.
  */
  addRoute(
    requestMethod: RequestMethod,
    requestPath: StrOrRegExp,
    requestHandler: RequestHandler,
  ): void {
    let lapiRoute: LapiRoute;

    if (isRegExp(requestPath)) {
      lapiRoute = new LapiRoute(requestMethod, "", requestHandler);
      lapiRoute.requestPathRegex = requestPath as RegExp;
    } else {
      lapiRoute = new LapiRoute(
        requestMethod,
        requestPath as string,
        requestHandler,
      );
    }

    this.routes.push(lapiRoute);
  }

  /** Adds a middleware that is to be ran before the request handler. */
  addMiddleware(middleware: Middleware): void {
    this.middlewares.push(middleware);
  }

  /** Adds a `POST` route. */
  post(path: StrOrRegExp, handler: RequestHandler): void {
    this.addRoute(RequestMethod.POST, path, handler);
  }

  /** Adds a `GET` route. */
  get(path: StrOrRegExp, handler: RequestHandler): void {
    this.addRoute(RequestMethod.GET, path, handler);
  }

  /** Adds a `PUT` route. */
  put(path: StrOrRegExp, handler: RequestHandler): void {
    this.addRoute(RequestMethod.PUT, path, handler);
  }

  /** Adds a `DELETE` route. */
  delete(path: StrOrRegExp, handler: RequestHandler): void {
    this.addRoute(RequestMethod.DELETE, path, handler);
  }

  /** Adds an `OPTIONS` route. */
  options(path: StrOrRegExp, handler: RequestHandler): void {
    this.addRoute(RequestMethod.OPTIONS, path, handler);
  }

  /** Adds a `HEAD` route. */
  head(path: StrOrRegExp, handler: RequestHandler): void {
    this.addRoute(RequestMethod.HEAD, path, handler);
  }

  /** Adds a `PATCH` route. */
  patch(path: StrOrRegExp, handler: RequestHandler): void {
    this.addRoute(RequestMethod.PATCH, path, handler);
  }

  /** Runs all middleware on the passed in request. */
  async runMiddleware(
    request: LapiRequest,
    response: LapiResponse,
  ): Promise<void> {
    if (this.timer) request.logger.time("middleware");
    for (const middleware of this.middlewares) {
      await middleware(request, response);
    }
    if (this.timer) request.logger.timeEnd("middleware");
  }

  /** Loops through the routes to find the handler for the given request.  */
  findRoute(request: ServerRequest): LapiRoute | null {
    const matches = this.routes.filter((route) => route.matches(request));

    if (matches.length === 0) {
      return null;
    }

    return matches[0];
  }
}
