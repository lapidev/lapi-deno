// Copyright 2020 Luke Shay. All rights reserved. MIT license.

import { Lapi, RequestMethod, ServerRequest } from "../mod.ts";
import { assertEquals } from "https://deno.land/std@0.70.0/testing/asserts.ts";

const lapi = new Lapi();

lapi.get("/hello", (req): void => {
  req.respond({ body: "Hello!" });
});

if (Deno.env.get("DENO_ENV") !== "TEST") {
  await lapi.start((): void => {
    console.log(
      `Server started on http://${lapi.serverHost}:${lapi.serverPort}`,
    );
  });
}

Deno.test('/hello should return { body: "Hello!" }', async () => {
  const responses: unknown[] = [];

  const request = {
    method: RequestMethod.GET,
    url: "/hello",
    respond: (res: any) => {
      responses.push(res);
    },
  } as unknown as ServerRequest;

  await lapi.handleRequest(request);

  assertEquals(responses[0], { body: "Hello!" });
});
