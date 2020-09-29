// Copyright 2020 Luke Shay. All rights reserved. MIT license.
/* @module lapi/lapi */

import {
  ServerRequest,
  serve,
  Server,
  Status,
} from "../deps.ts";
import { LapiBase, Middleware, Route } from "./lapi_base.ts";
import type { Router } from "./router.ts";
import { LapiError } from "./lapi_error.ts";

export type ErrorHandler = (
  request: ServerRequest,
  error: Error,
) => Promise<void> | void;

interface ApplicationOptions {
  serverPort?: number;
  serverHost?: string;
  errorHandler?: ErrorHandler;
  routers?: Router[];
  routes?: Route[];
  middlewares?: Middleware[];
}

/** Class used to create an API. This handles starting the server and sending requests to the correct location. */
export class Application extends LapiBase {
  routers: Router[];
  serverPort: number;
  serverHost: string;
  errorHandler?: ErrorHandler;

  private server?: Server;

  /** Creates a Lapi. */
  constructor(options?: ApplicationOptions) {
    if (options) {
      const {
        routes,
        routers,
        middlewares,
        serverPort,
        serverHost,
        errorHandler,
      } = options;
      super({ routes, middlewares });

      this.routers = routers || [];
      this.serverPort = serverPort || 3000;
      this.serverHost = serverHost || "0.0.0.0";
      this.errorHandler = errorHandler;
    } else {
      super();
      this.routers = [];
      this.serverPort = 3000;
      this.serverHost = "0.0.0.0";
    }
  }

  /** Adds the given router. */
  addRouter(router: Router): void {
    this.routers.push(router);
  }

  /** Loops through they routers to find the handler for the given request and runs the middleware for it. */
  async findRouteFromRouters(request: ServerRequest): Promise<Route | null> {
    for (const router of this.routers) {
      const route = router.findRoute(request);

      if (route) {
        await router.runMiddleware(request);
        return route;
      }
    }

    return null;
  }

  /**
   * Handles the given request. 
   * 
   * @throws {LapiError} if the route is not found.
   */
  async handleRequest(request: ServerRequest): Promise<void> {
    try {
      await this.runMiddleware(request);

      let route = this.findRoute(request);

      if (!route) route = await this.findRouteFromRouters(request);

      if (!route) {
        throw new LapiError("Path not found", Status.NotFound, request.url);
      }

      await route.requestHandler(request);
    } catch (error) {
      if (this.errorHandler) {
        this.errorHandler(request, error);
        return;
      }

      if (error instanceof LapiError) {
        const body = JSON.stringify(error.body || { message: error.message });

        if (!error.body) {
          request.headers.set("Content-type", "application/json");
        }

        request.respond({ status: error.status, body });
      } else {
        request.headers.set("Content-type", "application/json");
        request.respond(
          {
            status: Status.InternalServerError,
            body: JSON.stringify({ message: "An unexpected error occurred" }),
          },
        );
      }
    }
  }

  /** Starts the HTTP server. */
  async start(onStart?: () => Promise<void> | void): Promise<void> {
    this.server = serve({ hostname: this.serverHost, port: this.serverPort });

    if (onStart) onStart();

    for await (const request of this.server) {
      this.handleRequest(request);
    }
  }
}
