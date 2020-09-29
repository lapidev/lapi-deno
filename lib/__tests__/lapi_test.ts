// Copyright 2020 Luke Shay. All rights reserved. MIT license.

import { assertEquals, assert } from "../../deps_test.ts";
import type { ServerRequest } from "../../deps.ts";
import { Lapi } from "../lapi.ts";
import { testName } from "./utils_test.ts";

Deno.test({
  name: testName("Lapi", "constructor", "default values"),
  fn: () => {
    const lapi = new Lapi();

    assertEquals(lapi.serverPort, 3000);
    assertEquals(lapi.serverHost, "0.0.0.0");
    assert(!lapi.errorHandler);
  },
});

Deno.test({
  name: testName("Lapi", "constructor", "passed in values"),
  fn: () => {
    const lapi = new Lapi(
      {
        serverPort: 4000,
        serverHost: "1.2.3.4",
        errorHandler: (request: ServerRequest, error: Error) => {},
      },
    );

    assertEquals(lapi.serverPort, 4000);
    assertEquals(lapi.serverHost, "1.2.3.4");
    assert(lapi.errorHandler);
  },
});
