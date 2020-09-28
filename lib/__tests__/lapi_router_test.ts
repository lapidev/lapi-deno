// Copyright 2020 Luke Shay. All rights reserved. MIT license.

import { assert } from "../../deps_test.ts";
import { LapiRouter } from "../lapi_router.ts";
import { testName } from "./utils_test.ts";

Deno.test({
  name: testName("LapiRouter", "Constructor", ""),
  fn: () => {
    const lapiRouter = new LapiRouter();

    assert(lapiRouter);
  },
});
