// Copyright 2020 Luke Shay. All rights reserved. MIT license.

import { assertEquals, assert } from "../../deps_test.ts";
import type { ServerRequest } from "../../deps.ts";
import { Application } from "../application.ts";
import { testName } from "./utils_test.ts";
import { Router } from "../router.ts";
import { RequestMethod } from "../lapi_base.ts";

Deno.test({
  name: testName("Application", "constructor", "default values"),
  fn: () => {
    const application = new Application();

    assertEquals(application.serverPort, 3000);
    assertEquals(application.serverHost, "0.0.0.0");
    assert(!application.errorHandler);
  },
});

Deno.test({
  name: testName("Application", "constructor", "passed in values"),
  fn: () => {
    const application = new Application(
      {
        serverPort: 4000,
        serverHost: "1.2.3.4",
        errorHandler: (request: ServerRequest, error: Error) => {},
      },
    );

    assertEquals(application.serverPort, 4000);
    assertEquals(application.serverHost, "1.2.3.4");
    assert(application.errorHandler);
  },
});

Deno.test({
  name: testName("Application", "findRouteFromRouters", "finds router"),
  fn: async () => {
    const application = new Application(
      { serverPort: 4000, serverHost: "1.2.3.4" },
    );

    const routerOne = new Router();

    routerOne.post("/", () => {});
    routerOne.post("/path1", () => {});
    routerOne.get("/path1", () => {});

    const routerTwo = new Router();

    routerTwo.post("/2", () => {});
    routerTwo.post("/path2", () => {});
    routerTwo.get("/path2", () => {});

    application.addRouter(routerOne);
    application.addRouter(routerTwo);

    const route = await application.findRouteFromRouters(
      { url: "/path1", method: RequestMethod.POST } as unknown as ServerRequest,
    );

    assert(route);
    assertEquals(route.requestMethod, RequestMethod.POST);
    assertEquals(route.requestPath, "/path1");
  },
});
