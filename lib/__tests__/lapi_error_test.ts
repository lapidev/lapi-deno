import { assertStrictEquals, assert } from "testing/asserts.ts";
import { LapiError } from "../lapi_error.ts";

Deno.test({
  name: "LapiError Constructor Test - No Body",
  fn: () => {
    const lapiError = new LapiError(
      "This is a test for LapiError",
      123,
      "/path",
    );

    assertStrictEquals(lapiError.message, "This is a test for LapiError");
    assertStrictEquals(lapiError.status, 123);
    assertStrictEquals(lapiError.path, "/path");
    assertStrictEquals(lapiError.name, "LapiError");
    assert(!lapiError.body);
    assert(lapiError.stack);
  },
});
