// Copyright 2020 Luke Shay. All rights reserved. MIT license.
/* @module lapi/lapi */

import {
  ServerRequest,
  serve,
  Server,
  Status,
} from "http/mod.ts";
import { LapiError } from "./lapi_error.ts";

export type RequestHandler = (req: ServerRequest) => Promise<void> | void;

export type ErrorHandler = (
  request: ServerRequest,
  error: Error,
) => Promise<void> | void;

export enum RequestMethod {
  POST = "POST",
  GET = "GET",
  OPTIONS = "OPTIONS",
  DELETE = "DELETE",
  PUT = "PUT",
}

export type Route = {
  requestHandler: RequestHandler;
  requestMethod: RequestMethod;
  requestPath: string;
};

/** Class used to create an API. This handles starting the server and sending requests to the correct location. */
export class Lapi {
  private _routes: Route[] = [];
  private _serverPort: number;
  private _serverHost: string;

  private server?: Server;
  private _errorHandler?: ErrorHandler;

  /** Creates a Lapi. */
  constructor(
    serverPort: number = 3000,
    serverHost: string = "0.0.0.0",
    errorHandler?: ErrorHandler,
  ) {
    this._serverHost = serverHost;
    this._serverPort = serverPort;
    this._errorHandler = errorHandler;
  }

  addRoute(requestMethod: RequestMethod, path: string, handler: RequestHandler) {
    this._routes.push(
      {
        requestMethod: requestMethod,
        requestPath: path,
        requestHandler: handler,
      },
    );
  }

  set errorHandler(errorHandler: ErrorHandler) {
    this._errorHandler = errorHandler;
  }

  get serverHost() {
    return this._serverHost;
  }

  get serverPort() {
    return this._serverPort;
  }

  /**
   * Finds the route from this.routes that has the same method and URL as the passed in request.
   * 
   * @throws {LapiError} if the route is not found.
   */
  private findRoute({ method, url }: ServerRequest): Route {
    const matches = this._routes.filter((route) =>
      route.requestMethod === method &&
      route.requestPath === url
    );

    if (matches.length === 0) {
      throw new LapiError("Path not found", Status.NotFound, url);
    }

    return matches[0];
  }

  /** Handles the given request. */
  private async handleRequest(request: ServerRequest) {
    try {
      const route = this.findRoute(request);
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
  async start(onStart?: () => Promise<void> | void) {
    this.server = serve({ hostname: this.serverHost, port: this.serverPort });

    if (onStart) onStart();

    for await (const request of this.server) {
      this.handleRequest(request);
    }
  }
}
