import { Request } from "./request.ts";

export enum RequestMethod {
  POST = "POST",
  GET = "GET",
  OPTIONS = "OPTIONS",
  DELETE = "DELETE",
  PUT = "PUT",
  HEAD = "HEAD",
  PATCH = "PATCH",
}

export type RequestHandler = (req: Request) => Promise<void> | void;

export interface Route {
  requestHandler: RequestHandler;
  requestMethod: RequestMethod;
  requestPath: string;
}

/** Class used to store the information of a route. */
export class LapiRoute implements Route {
  public requestPathRegex: RegExp;

  /**
   * Constructs a LapiRoute. Parses request path into a regular expression using
   * `<paramName>` to signify path parameters.
   */
  constructor(
    public requestMethod: RequestMethod,
    public requestPath: string,
    public requestHandler: RequestHandler,
  ) {
    this.requestPathRegex = new RegExp(
      `^${(requestPath as string).replace(/\/(<[^/]+>)/g, "/(?$1[^/]+)")}$`,
    );
  }

  /** Constructs a LapiRoute from a Route. */
  static FromRoute(route: Route) {
    const { requestMethod, requestPath, requestHandler } = route;
    return new LapiRoute(
      requestMethod,
      requestPath,
      requestHandler,
    );
  }

  /** Determine wether this route matches the received request. */
  public matches(request: Request) {
    const { method, url } = request;

    return this.requestMethod === method && this.requestPathRegex.test(url);
  }
}
