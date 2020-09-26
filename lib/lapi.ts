// Copyright 2020 Luke Shay. All rights reserved. MIT license.
/* @module lapi/lapi */

import {
  ServerRequest,
  serve,
  Server,
  Status,
} from "../deps.ts";
import { LapiBase, Middleware, Route } from "./lapi-base.ts";
import type { LapiRouter } from "./lapi-router.ts";
import { LapiError } from "./lapi_error.ts";

export type ErrorHandler = (
  request: ServerRequest,
  error: Error,
) => Promise<void> | void;

interface LapiOptions {
  serverPort?: number;
  serverHost?: string;
  errorHandler?: ErrorHandler;
  routers?: LapiRouter[];
  routes?: Route[];
  middlewares?: Middleware[];
}

/** Class used to create an API. This handles starting the server and sending requests to the correct location. */
export class Lapi extends LapiBase {
  routers: LapiRouter[];
  serverPort: number;
  serverHost: string;
  errorHandler?: ErrorHandler;

  private server?: Server;

  /** Creates a Lapi. */
  constructor(options?: LapiOptions) {
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

  private findRouteFromRouters(request: ServerRequest): Route | null {
    for (const router of this.routers) {
      const route = router.findRoute(request);

      if (route) {
        for (const middleware of router.middlewares) {
          middleware(request);
        }

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
  private async handleRequest(request: ServerRequest): Promise<void> {
    try {
      for (const middleware of this.middlewares) {
        await middleware(request);
      }

      let route = this.findRoute(request);

      if (!route) route = this.findRouteFromRouters(request);

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
