import { ServerRequest } from "./deps.ts";
import { Request } from "./request.ts";

export class StdRequest implements Request {
  #serverRequest: ServerRequest;
  #domain: string;
  #pathParams: Record<string, string> = {};
  #pathParamsSet = false;

  constructor(requestParams: ServerRequest, domain: string) {
    this.#serverRequest = requestParams;
    this.#domain = domain;
  }

  get method() {
    return this.#serverRequest.method;
  }

  get url() {
    return new URL(`${this.#domain}${this.#serverRequest.url}`);
  }

  get body() {
    return this.#serverRequest.body;
  }

  get headers() {
    return this.#serverRequest.headers;
  }

  get proto() {
    return this.#serverRequest.proto;
  }

  set pathParams(pathParams: Record<string, string>) {
    if (!this.#pathParamsSet) {
      this.#pathParams = pathParams;
    }
  }

  get pathParams() {
    return this.#pathParams;
  }
}
