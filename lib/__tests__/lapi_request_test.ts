// Copyright 2020 Luke Shay. All rights reserved. MIT license.

import type { ServerRequest } from "../../deps.ts";
import { assertEquals, spy } from "../../deps_test.ts";
import { RequestMethod } from "../lapi_route.ts";
import { LapiRequest } from "../lapi_request.ts";
import { id } from "../utils.ts";
import { testName } from "./test_utils.ts";

Deno.test(
  {
    name: testName("Request", "method", "returns the method"),
    fn: () => {
      const request = new LapiRequest(
        id(),
        { url: "/path", method: RequestMethod.GET } as ServerRequest,
        new RegExp(""),
        "",
      );

      assertEquals(request.method, RequestMethod.GET);
    },
  },
);

Deno.test(
  {
    name: testName("Request", "queries", "returns the method"),
    fn: () => {
      const request = new LapiRequest(
        id(),
        {
          url: "/path?one=valueOne&two=valueTwo",
          method: RequestMethod.GET,
        } as ServerRequest,
        new RegExp(""),
        "",
      );

      assertEquals(request.queries.one, "valueOne");
      assertEquals(request.queries.two, "valueTwo");
    },
  },
);

Deno.test(
  {
    name: testName("Request", "params", "returns the params"),
    fn: () => {
      const request = new LapiRequest(
        id(),
        {
          url: "/path/param",
          method: RequestMethod.GET,
        } as ServerRequest,
        new RegExp(/\/path\/(?<param>[^/]+)/),
        "",
      );

      assertEquals(request.params.param, "param");
    },
  },
);
