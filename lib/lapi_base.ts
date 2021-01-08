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

export type Lapiware = (
  req: LapiRequest,
  res: LapiResponse,
) => Promise<void> | void;

export type Middleware = Lapiware;
export type Postware = Lapiware;

export interface LapiBaseOptions {
  middlewares?: Middleware[];
  postwares?: Postware[];
  routes?: Route[];
  basePath?: string;
}

/** Base class to be used if you need a class that supports middlewares and routes. */
export class LapiBase {
  _middlewares: Middleware[];
  _postwares: Postware[];
  _routes: LapiRoute[];
  _basePath: string;

  /** Constructs a LapiBase class */
  constructor(options?: LapiBaseOptions) {
    this._middlewares = options?.middlewares || [];
    this._postwares = options?.postwares || [];
    this._routes = options?.routes?.map(LapiRoute.FromRoute) || [];
    this._basePath = options?.basePath || "";
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
      lapiRoute.requestPathRegex = (requestPath as RegExp);
    } else {
      lapiRoute = new LapiRoute(
        requestMethod,
        requestPath as string,
        requestHandler,
      );
    }

    this._routes.push(lapiRoute);
  }

  /** Adds a middleware that is to be ran before the request handler. */
  addMiddleware(...middleware: Middleware[]): void {
    this._middlewares.push(...middleware);
  }

  /** Adds a postware that is to be ran before the request handler. */
  addPostware(...postware: Postware[]): void {
    this._postwares.push(...postware);
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
  async _runMiddleware(
    request: LapiRequest,
    response: LapiResponse,
  ): Promise<void> {
    await LapiBase.runLapiWare(request, response, this._middlewares);
  }

  /** Runs all postware on the passed in request. */
  async _runPostware(
    request: LapiRequest,
    response: LapiResponse,
  ): Promise<void> {
    await LapiBase.runLapiWare(request, response, this._postwares);
  }

  private static async runLapiWare(
    request: LapiRequest,
    response: LapiResponse,
    lapiwares: Lapiware[],
  ): Promise<void> {
    for (const lapiware of lapiwares) {
      await lapiware(request, response);
    }
  }

  /** Loops through the routes to find the handler for the given request.  */
  findRoute(request: ServerRequest): LapiRoute | null {
    if (!request.url.startsWith(`${this._basePath}`)) {
      return null;
    }

    const matches = this._routes.filter((route) =>
      route.matches(
        {
          ...request,
          url: request.url.replace(this._basePath, ""),
        } as ServerRequest,
      )
    );

    if (matches.length === 0) {
      return null;
    }

    return matches[0];
  }
}
