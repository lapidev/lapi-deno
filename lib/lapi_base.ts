// Copyright 2020 Luke Shay. All rights reserved. MIT license.
/* @module lapi/lapi_base */

import { LapiError } from "./lapi_error.ts";
import type { Request } from "./request.ts";
import { isObject, isString } from "./utils.ts";

export type RequestHandler = (req: Request) => Promise<void> | void;
export type Middleware = (req: Request) => Promise<void> | void;

export enum RequestMethod {
  POST = "POST",
  GET = "GET",
  OPTIONS = "OPTIONS",
  DELETE = "DELETE",
  PUT = "PUT",
  HEAD = "HEAD",
  PATCH = "PATCH",
}

export type Params = { [index: string]: string };

export interface Route {
  requestHandler: RequestHandler;
  requestMethod: RequestMethod;
  requestPath: string;
}

export interface LapiBaseOptions {
  middlewares?: Middleware[];
  routes?: Route[];
  timer?: boolean;
}

interface LapiRoute extends Route {
  requestPathRegex: RegExp;
  params: Params;
}

/** Base class to be used if you need a class that supports middlewares and routes. */
export class LapiBase {
  middlewares: Middleware[];
  routes: LapiRoute[];
  timer = false;

  /** Constructs a LapiBase class */
  constructor(options?: LapiBaseOptions) {
    this.middlewares = options?.middlewares || [];
    this.timer = options?.timer || false;
    this.routes = options?.routes?.map(this.mapRouteToLapiRoute) || [];
  }

  /** Takes in the route and parses the attributes to make it a LapiRoute. */
  private mapRouteToLapiRoute(route: Route): LapiRoute {
    const params: Params = {};

    route.requestPath.split("/").forEach((value, index) => {
      if (value.startsWith(":")) {
        params[index.toString()] = value.substring(1);
      }
    });

    const requestPathRegex = new RegExp(
      `^${route.requestPath.replace(/\/:[a-z0-9]+/g, "/.+")}$`,
    );

    return {
      ...route,
      params,
      requestPathRegex,
    };
  }

  /** Adds a request handler for the given method and path. 
   * 
   * @throws {Error} - If the parameters are invalid.
  */
  addRoute(
    requestMethod: RequestMethod,
    path: string,
    handler: RequestHandler,
  ): void;

  /** Adds the given route. 
   * 
   * @throws {Error} - If the parameters are invalid.
  */
  addRoute(route: Route): void;

  /** 
   * Overloaded method implementation. 
   * 
   * @throws {Error} - If the parameters are invalid.
  */
  addRoute(
    paramOne: RequestMethod | Route,
    paramTwo?: string,
    paramThree?: RequestHandler,
  ): void {
    if (paramTwo && paramThree && isString(paramOne)) {
      this.routes.push(
        this.mapRouteToLapiRoute({
          requestMethod: paramOne as RequestMethod,
          requestPath: paramTwo,
          requestHandler: paramThree,
        }),
      );
    } else if (isObject(paramOne)) {
      this.routes.push(this.mapRouteToLapiRoute(paramOne as Route));
    } else {
      throw new Error("Invalid parameters");
    }
  }

  /** Adds a middleware that is to be ran before the request handler. */
  addMiddleware(middleware: Middleware): void {
    this.middlewares.push(middleware);
  }

  /** Adds a `POST` route. */
  post(path: string, handler: RequestHandler): void {
    this.addRoute(RequestMethod.POST, path, handler);
  }

  /** Adds a `GET` route. */
  get(path: string, handler: RequestHandler): void {
    this.addRoute(RequestMethod.GET, path, handler);
  }

  /** Adds a `PUT` route. */
  put(path: string, handler: RequestHandler): void {
    this.addRoute(RequestMethod.PUT, path, handler);
  }

  /** Adds a `DELETE` route. */
  delete(path: string, handler: RequestHandler): void {
    this.addRoute(RequestMethod.DELETE, path, handler);
  }

  /** Adds an `OPTIONS` route. */
  options(path: string, handler: RequestHandler): void {
    this.addRoute(RequestMethod.OPTIONS, path, handler);
  }

  /** Adds a `HEAD` route. */
  head(path: string, handler: RequestHandler): void {
    this.addRoute(RequestMethod.HEAD, path, handler);
  }

  /** Adds a `PATCH` route. */
  patch(path: string, handler: RequestHandler): void {
    this.addRoute(RequestMethod.PATCH, path, handler);
  }

  /** Runs all middleware on the passed in request. */
  async runMiddleware(request: Request): Promise<void> {
    if (this.timer) request.logger.time("middleware");
    for (const middleware of this.middlewares) {
      await middleware(request);
    }
    if (this.timer) request.logger.timeEnd("middleware");
  }

  /** Loops through the routes to find the handler for the given request.  */
  findRoute({ method, url }: Request): Route | null {
    const matches = this.routes.filter((route) =>
      route.requestMethod === method &&
      route.requestPathRegex.test(url)
    );

    if (matches.length === 0) {
      return null;
    }

    return matches[0];
  }
}
