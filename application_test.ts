// Copyright 2020 Luke Shay. All rights reserved. MIT license.

import { assert } from "./deps_test.ts";
import { Application } from "./application.ts";

Deno.test({
  name: "contstructor",
  fn: () => {
    assert(new Application());
  },
});
