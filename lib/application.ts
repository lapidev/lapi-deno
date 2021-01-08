// Copyright 2020 Luke Shay. All rights reserved. MIT license.
/* @module lapi/application */

import { serve, Server, ServerRequest, Status } from "../deps.ts";
import { LapiBase, LapiBaseOptions, Middleware, Postware } from "./lapi_base.ts";
import { LapiRoute } from "./lapi_route.ts";
import type { Controller } from "./controller.ts";
import { LapiError } from "./lapi_error.ts";
import { LapiRequest } from "./lapi_request.ts";
import { LapiResponse } from "./lapi_response.ts";
import { id } from "./utils.ts";
import { Header } from "./header.ts";
import { ContentType } from "./content_type.ts";

export type ErrorHandler = (
  request: LapiRequest,
  response: LapiResponse,
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

  private _errorHandler: ErrorHandler;
  private _server?: Server;

  /** Constructs an Application. */
  constructor(options?: ApplicationOptions) {
    super(options);

    this._errorHandler = options?.errorHandler || this._defaultErrorHandler;

    if (options) {
      const {
        controllers,
        serverPort,
        serverHost,
      } = options;

      this.controllers = controllers || [];
      this.serverPort = serverPort || 3000;
      this.serverHost = serverHost || "0.0.0.0";
    }
  }

  private _defaultErrorHandler(
    request: LapiRequest,
    response: LapiResponse,
    error: Error,
  ): void {
    if (error instanceof LapiError) {
      const body = JSON.stringify(error.body || { message: error.message });

      if (!error.body) {
        response.setHeader(Header.ContentType, ContentType.ApplicationJson);
      }

      response.respond({ status: error.status, body });
    } else {
      response.setHeader(Header.ContentType, ContentType.ApplicationJson);
      response.respond(
        {
          status: Status.InternalServerError,
          body: JSON.stringify({ message: "An unexpected error occurred" }),
        },
      );
    }
  }

  /** Adds the given router. */
  addController(router: Controller): void {
    this.controllers.push(router);
  }

  /** Loops through they routers to find the handler for the given request and runs the middleware for it. */
  findRouteFromControllers(
    request: ServerRequest,
  ): [LapiRoute | null, LapiBase | null] {
    for (const controller of this.controllers) {
      const route = controller.findRoute(request);

      if (route) {
        return [route, controller];
      }
    }

    return [null, null];
  }

  /**
   * Handles the given request. The following is the basic flow:
   * 
   * 1. Look for handler in application routes
   * 2. Look for handler in controller if wasn't found
   * 3. If none found, return a 404
   * 4. Run base middleware
   * 5. Run controller middleware
   * 6. Run handler
   * 7. Run controller postware
   * 8. Run base postware
   * 9. If there is an error thrown in steps 4-8, the error handler will be
   * invoked
   * 10. Send response to requester
   * 
   * @throws {LapiError} if the route is not found.
   */
  async handleRequest(serverRequest: ServerRequest): Promise<void> {
    let controller = null;
    let route = this.findRoute(serverRequest); // 1

    if (!route) [route, controller] = this.findRouteFromControllers(serverRequest); // 2

    const rid = id();

    const request = new LapiRequest(
      rid,
      serverRequest,
      route?.requestPathRegex || new RegExp(/.*/),
      this.utf8TextDecoder.decode(
        await Deno.readAll(serverRequest.body),
      ),
    );
    const response = new LapiResponse(rid, serverRequest);

    try {
      if (!route) { // 3
        throw new LapiError(
          "Path not found",
          Status.NotFound,
          serverRequest.url,
        );
      }

      request.logger.info(
        `${serverRequest.proto} - ${request.method} - ${request.url}`,
      );

      await this._runMiddleware(request, response); // 4

      if (controller) {
        await controller._runMiddleware(request, response); // 5
      }

      await route.requestHandler(request, response); // 6

      if (controller) {
        await controller._runPostware(request, response); // 7
      }

      await this._runPostware(request, response); // 8
    } catch (error) {
      this._errorHandler(request, response, error); // 9
    }

    await serverRequest.respond(response.getResponse()); // 10
  }

  /** Starts the HTTP server. */
  async start(onStart?: () => Promise<void> | void): Promise<void> {
    this._server = serve({ hostname: this.serverHost, port: this.serverPort });

    onStart && onStart();

    for await (const serverRequest of this._server) {
      this.handleRequest(serverRequest);
    }
  }
}
