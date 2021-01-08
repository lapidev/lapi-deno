// Copyright 2020 Luke Shay. All rights reserved. MIT license.

import { assert, assertEquals } from "../../deps_test.ts";
import type { ServerRequest } from "../../deps.ts";
import { Application } from "../application.ts";
import { testName } from "./test_utils.ts";
import { Controller } from "../controller.ts";
import { RequestMethod } from "../lapi_route.ts";
import { LapiRequest } from "../lapi_request.ts";
import { id } from "../utils.ts";
import { LapiResponse } from "../lapi_response.ts";

Deno.test({
  name: testName("Application", "constructor", "default values"),
  fn: () => {
    const application = new Application();

    assertEquals(application.serverPort, 3000);
    assertEquals(application.serverHost, "0.0.0.0");
  },
});

Deno.test({
  name: testName("Application", "constructor", "passed in values"),
  fn: () => {
    const application = new Application(
      {
        serverPort: 4000,
        serverHost: "1.2.3.4",
        errorHandler: (
          request: LapiRequest,
          response: LapiResponse,
          error: Error,
        ) => {},
      },
    );

    assertEquals(application.serverPort, 4000);
    assertEquals(application.serverHost, "1.2.3.4");
  },
});

Deno.test({
  name: testName("Application", "findRouteFromControllers", "finds controller"),
  fn: () => {
    const application = new Application(
      { serverPort: 4000, serverHost: "1.2.3.4" },
    );

    const controllerOne = new Controller();

    controllerOne.post("/", () => {});
    controllerOne.post("/path1", () => {});
    controllerOne.get("/path1", () => {});

    const controllerTwo = new Controller();

    controllerTwo.post("/2", () => {});
    controllerTwo.post("/path2", () => {});
    controllerTwo.get("/path2", () => {});

    application.addController(controllerOne);
    application.addController(controllerTwo);

    const serverRequest = {
      url: "/path1",
      method: RequestMethod.POST,
    } as unknown as ServerRequest;

    const [route, router] = application.findRouteFromControllers(
      serverRequest,
    );

    assert(route);
    assert(router);
    assertEquals(route.requestMethod, RequestMethod.POST);
    assertEquals(route.requestPath, "/path1");
  },
});
