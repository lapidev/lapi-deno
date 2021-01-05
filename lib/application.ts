// Copyright 2020 Luke Shay. All rights reserved. MIT license.
/* @module lapi/application */

import { serve, Server, ServerRequest, Status } from "../deps.ts";
import { LapiBase, LapiBaseOptions } from "./lapi_base.ts";
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
  findRouteFromRouters(
    request: ServerRequest,
  ): LapiRoute | null {
    for (const router of this.controllers) {
      const route = router.findRoute(request);

      if (route) {
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
  async handleRequest(serverRequest: ServerRequest): Promise<void> {
    let route = this.findRoute(serverRequest);

    if (!route) route = this.findRouteFromRouters(serverRequest);

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
      if (!route) {
        throw new LapiError(
          "Path not found",
          Status.NotFound,
          serverRequest.url,
        );
      }

      request.logger.info(
        `${serverRequest.proto} - ${request.method} - ${request.url}`,
      );

      await this.runMiddleware(request, response);

      if (this.timer) request.logger.time("handler");

      await route.requestHandler(request, response);
    } catch (error) {
      this._errorHandler(request, response, error);
    }

    try {
      await serverRequest.respond(response.getResponse());
    } catch (error) {
      this._errorHandler(request, response, error);
    }

    if (this.timer) request.logger.timeEnd("handler");
  }

  /** Starts the HTTP server. */
  async start(onStart?: () => Promise<void> | void): Promise<void> {
    this._server = serve({ hostname: this.serverHost, port: this.serverPort });

    if (onStart) onStart();

    for await (const serverRequest of this._server) {
      this.handleRequest(serverRequest);
    }
  }
}
