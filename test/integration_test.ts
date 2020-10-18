// Copyright 2020 Luke Shay. All rights reserved. MIT license.

import { assertEquals, delay } from "../deps_test.ts";
import { RequestMethod } from "../lib/lapi_route.ts";

Deno.test({
  name: "Lapi integration test",
  fn: async () => {
    const api = Deno.run(
      { cmd: ["deno", "run", "--allow-net", "test/api.ts"] },
    );

    await delay(1000);

    const getResult = await fetch("http://localhost:3000/hello/Luke");

    assertEquals(await getResult.json(), { message: "Hello, Luke!" });

    const postResult = await fetch(
      "http://localhost:3000/post-endpoint/some-id",
      { method: RequestMethod.POST },
    );

    assertEquals(await postResult.text(), "some-id");

    api.close();
  },
});
