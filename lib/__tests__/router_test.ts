// Copyright 2020 Luke Shay. All rights reserved. MIT license.

import { assert } from "../../deps_test.ts";
import { Router } from "../router.ts";
import { testName } from "./utils_test.ts";

Deno.test({
  name: testName("Router", "constructor", ""),
  fn: () => {
    const router = new Router();

    assert(router);
  },
});
