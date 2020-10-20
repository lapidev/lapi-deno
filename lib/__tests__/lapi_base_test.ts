// Copyright 2020 Luke Shay. All rights reserved. MIT license.

import { LapiRequest } from "../lapi_request.ts";
import { assert, assertEquals, Spy, spy } from "../../deps_test.ts";
import { LapiBase } from "../lapi_base.ts";
import { RequestMethod } from "../lapi_route.ts";
import { testName } from "./test_utils.ts";
import type { ServerRequest } from "../../deps.ts";
import { id } from "../utils.ts";
import { LapiResponse } from "../lapi_response.ts";

Deno.test({
  name: testName(
    "LapiBase",
    "constructor",
    "default values",
  ),
  fn: () => {
    const lapiBase = new LapiBase();

    assertEquals(lapiBase.middlewares.length, 0);
    assertEquals(lapiBase.routes.length, 0);
  },
});

Deno.test({
  name: testName(
    "LapiBase",
    "addRoute",
    "adds route to routes array",
  ),
  fn: () => {
    const lapiBase = new LapiBase();

    lapiBase.addRoute(RequestMethod.POST, "/path", (_req: LapiRequest) => {});

    assertEquals(lapiBase.routes.length, 1);
  },
});

Deno.test({
  name: testName(
    "LapiBase",
    "addMiddleware",
    "adds route to middleware array",
  ),
  fn: () => {
    const lapiBase = new LapiBase();

    lapiBase.addMiddleware((_req: LapiRequest) => {});

    assertEquals(lapiBase.middlewares.length, 1);
  },
});

Deno.test({
  name: testName(
    "LapiBase",
    "post",
    "adds POST route to routes array",
  ),
  fn: () => {
    const lapiBase = new LapiBase();

    lapiBase.post("/path", (_req: LapiRequest) => {});

    assertEquals(lapiBase.routes.length, 1);
    assertEquals(lapiBase.routes[0].requestMethod, RequestMethod.POST);
  },
});

Deno.test({
  name: testName(
    "LapiBase",
    "get",
    "adds GET route to routes array",
  ),
  fn: () => {
    const lapiBase = new LapiBase();

    lapiBase.get("/path", (_req: LapiRequest) => {});

    assertEquals(lapiBase.routes.length, 1);
    assertEquals(lapiBase.routes[0].requestMethod, RequestMethod.GET);
  },
});

Deno.test({
  name: testName(
    "LapiBase",
    "put",
    "adds PUT route to routes array",
  ),
  fn: () => {
    const lapiBase = new LapiBase();

    lapiBase.put("/path", (_req: LapiRequest) => {});

    assertEquals(lapiBase.routes.length, 1);
    assertEquals(lapiBase.routes[0].requestMethod, RequestMethod.PUT);
  },
});

Deno.test({
  name: testName(
    "LapiBase",
    "delete",
    "adds DELETE route to routes array",
  ),
  fn: () => {
    const lapiBase = new LapiBase();

    lapiBase.delete("/path", (_req: LapiRequest) => {});

    assertEquals(lapiBase.routes.length, 1);
    assertEquals(lapiBase.routes[0].requestMethod, RequestMethod.DELETE);
  },
});

Deno.test({
  name: testName(
    "LapiBase",
    "options",
    "adds OPTIONS route to routes array",
  ),
  fn: () => {
    const lapiBase = new LapiBase();

    lapiBase.options("/path", (_req: LapiRequest) => {});

    assertEquals(lapiBase.routes.length, 1);
    assertEquals(lapiBase.routes[0].requestMethod, RequestMethod.OPTIONS);
  },
});

Deno.test({
  name: testName(
    "LapiBase",
    "head",
    "adds HEAD route to routes array",
  ),
  fn: () => {
    const lapiBase = new LapiBase();

    lapiBase.head("/path", (_req: LapiRequest) => {});

    assertEquals(lapiBase.routes.length, 1);
    assertEquals(lapiBase.routes[0].requestMethod, RequestMethod.HEAD);
  },
});

Deno.test({
  name: testName(
    "LapiBase",
    "patch",
    "adds PATCH route to routes array",
  ),
  fn: () => {
    const lapiBase = new LapiBase();

    lapiBase.patch("/path", (_req: LapiRequest) => {});

    assertEquals(lapiBase.routes.length, 1);
    assertEquals(lapiBase.routes[0].requestMethod, RequestMethod.PATCH);
  },
});

Deno.test({
  name: testName(
    "LapiBase",
    "findRoute",
    "finds correct route",
  ),
  fn: () => {
    const lapiBase = new LapiBase();

    lapiBase.patch("/path", (_req: LapiRequest) => {});
    lapiBase.post("/path", (_req: LapiRequest) => {});
    lapiBase.get("/path", (_req: LapiRequest) => {});
    lapiBase.post("/path2", (_req: LapiRequest) => {});

    const serverRequest = {
      method: RequestMethod.POST,
      url: "/path",
    } as unknown as ServerRequest;

    const route = lapiBase.findRoute(serverRequest);

    assert(route);
    assertEquals(route.requestMethod, RequestMethod.POST);
    assertEquals(route.requestPath, "/path");
  },
});

Deno.test({
  name: testName(
    "LapiBase",
    "findRoute",
    "doesn't find route",
  ),
  fn: () => {
    const lapiBase = new LapiBase();

    lapiBase.patch("/path", (_req: LapiRequest) => {});
    lapiBase.post("/path", (_req: LapiRequest) => {});
    lapiBase.get("/path", (_req: LapiRequest) => {});
    lapiBase.post("/path2", (_req: LapiRequest) => {});

    const serverRequest = {
      method: RequestMethod.DELETE,
      url: "/path",
    } as unknown as ServerRequest;

    const route = lapiBase.findRoute(serverRequest);

    assert(!route);
  },
});

Deno.test({
  name: testName(
    "LapiBase",
    "runMiddleware",
    "runs middleware",
  ),
  fn: async () => {
    const lapiBase = new LapiBase();
    const middlewares: Spy<void>[] = [spy(), spy(), spy()];

    lapiBase.addMiddleware(middlewares[0]);
    lapiBase.addMiddleware(middlewares[1]);
    lapiBase.addMiddleware(middlewares[2]);

    const mockRequest = { request: "asdf" } as unknown as LapiRequest;
    const mockResponse = { response: "asdf" } as unknown as LapiResponse;

    await lapiBase.runMiddleware(mockRequest, mockResponse);

    assertEquals(middlewares[0].calls, [{ args: [mockRequest, mockResponse] }]);
    assertEquals(middlewares[1].calls, [{ args: [mockRequest, mockResponse] }]);
    assertEquals(middlewares[2].calls, [{ args: [mockRequest, mockResponse] }]);
  },
});
