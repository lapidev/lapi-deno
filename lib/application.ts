// Copyright 2020 Luke Shay. All rights reserved. MIT license.
/* @module lapi/application */

import { serve, Server, Status } from "../deps.ts";
import { LapiBase, LapiBaseOptions } from "./lapi_base.ts";
import { LapiRoute } from "./lapi_route.ts";
import type { Controller } from "./controller.ts";
import { LapiError } from "./lapi_error.ts";
import { Request } from "./request.ts";
import { id } from "./utils.ts";

export type ErrorHandler = (
  request: Request,
  error: Error,
) => Promise<void> | void;

interface ApplicationOptions extends LapiBaseOptions {
  serverPort?: number;
  serverHost?: string;
  errorHandler?: ErrorHandler;
  controllers?: Controller[];
  timer?: boolean;
}

/** Class used to create an API. This handles starting the server and sending requests to the correct location. */
export class Application extends LapiBase {
  controllers: Controller[] = [];
  serverPort = 3000;
  serverHost = "0.0.0.0";
  utf8TextDecoder = new TextDecoder("utf8");
  errorHandler?: ErrorHandler;

  private server?: Server;

  /** Constructs an Application. */
  constructor(options?: ApplicationOptions) {
    super(options);

    if (options) {
      const {
        controllers,
        errorHandler,
        serverPort,
        serverHost,
      } = options;

      this.controllers = controllers || [];
      this.errorHandler = errorHandler;
      this.serverPort = serverPort || 3000;
      this.serverHost = serverHost || "0.0.0.0";
    }
  }

  /** Adds the given router. */
  addController(router: Controller): void {
    this.controllers.push(router);
  }

  /** Loops through they routers to find the handler for the given request and runs the middleware for it. */
  async findRouteFromRouters(request: Request): Promise<LapiRoute | null> {
    for (const router of this.controllers) {
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
  async handleRequest(request: Request): Promise<void> {
    try {
      let route = this.findRoute(request);

      if (!route) route = await this.findRouteFromRouters(request);

      if (!route) {
        throw new LapiError(
          "Path not found",
          Status.NotFound,
          request.url,
        );
      }

      await this.runMiddleware(request);

      if (this.timer) request.logger.time("handler");
      await route.requestHandler(request);
      if (this.timer) request.logger.timeEnd("handler");
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

        request.send({ status: error.status, body });
      } else {
        request.headers.set("Content-type", "application/json");
        request.send(
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

    for await (const serverRequest of this.server) {
      const body = this.utf8TextDecoder.decode(
        await Deno.readAll(serverRequest.body),
      );

      const request = new Request(id(), serverRequest, body);

      request.logger.info(
        `${serverRequest.proto} - ${request.method} - ${request.url}`,
      );

      this.handleRequest(request);
    }
  }
}
