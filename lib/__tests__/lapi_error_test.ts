// Copyright 2020 Luke Shay. All rights reserved. MIT license.

import { assertEquals, assert } from "../../deps_test.ts";
import { LapiError } from "../lapi_error.ts";
import { testName } from "./utils_test.ts";

Deno.test({
  name: testName("LapiError", "constructor", "no body"),
  fn: () => {
    const lapiError = new LapiError(
      "This is a for LapiError",
      123,
      "/path",
    );

    assertEquals(lapiError.message, "This is a for LapiError");
    assertEquals(lapiError.status, 123);
    assertEquals(lapiError.path, "/path");
    assertEquals(lapiError.name, "LapiError");
    assert(!lapiError.body);
    assert(lapiError.stack);
  },
});

Deno.test({
  name: testName("LapiError", "constructor", "body"),
  fn: () => {
    const lapiError = new LapiError(
      "This is a for LapiError",
      123,
      "/path",
      { key: "the body" },
    );

    assertEquals(lapiError.message, "This is a for LapiError");
    assertEquals(lapiError.status, 123);
    assertEquals(lapiError.path, "/path");
    assertEquals(lapiError.name, "LapiError");
    assertEquals(lapiError.body, { key: "the body" });
    assert(lapiError.stack);
  },
});
