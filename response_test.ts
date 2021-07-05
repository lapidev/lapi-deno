import { Context } from "./context.ts";
import { Status } from "./deps.ts";
import { assert, assertEquals } from "./deps_test.ts";
import { Response, updateTypeAndGetBody } from "./response.ts";

Deno.test({
  name: "response headers get set",
  fn: function () {
    const response = new Response();

    const headerValue = "this is the value";

    response.headers.set("some-header", headerValue);

    assertEquals(response.headers.get("some-header"), headerValue);
  },
});

Deno.test({
  name: "handled is true when body is set",
  fn: function () {
    const response = new Response();

    response.body = "";

    assert(response.handled);
  },
});

Deno.test({
  name: "handled is true when status is set",
  fn: function () {
    const response = new Response();

    response.status = Status.OK;

    assert(response.handled);
  },
});

Deno.test({
  name: "updateTypeAndGetBody calls renderer with body and content type",
  fn: async function () {
    const response = new Response();

    const typeValue = "this is the value";
    response.headers.set("Content-type", typeValue);

    const bodyValue = "this is the body value";
    response.body = bodyValue;

    const bodyResult = new TextEncoder().encode(bodyValue);

    const bodyReturn = await updateTypeAndGetBody(
      { response } as unknown as Context,
      (body, type) => {
        assertEquals(body, bodyValue);
        assertEquals(type, typeValue);

        return { body: bodyResult, type: typeValue };
      },
    );

    assertEquals(bodyReturn, bodyResult);
    assertEquals(response.headers.get("Content-type"), typeValue);
  },
});
