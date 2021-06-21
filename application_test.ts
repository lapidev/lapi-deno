import { assert } from "./deps_test.ts";
import { Application } from "./application.ts";

Deno.test({
  name: "contstructor",
  fn: () => {
    assert(new Application());
  },
});
