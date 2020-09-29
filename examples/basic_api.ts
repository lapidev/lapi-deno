// Copyright 2020 Luke Shay. All rights reserved. MIT license.

import { Application, RequestMethod, ServerRequest } from "../mod.ts";
import { assertEquals } from "https://deno.land/std@0.70.0/testing/asserts.ts";

const application = new Application();

application.get("/hello", (req): void => {
  req.respond({ body: "Hello!" });
});

if (Deno.env.get("DENO_ENV") !== "TEST") {
  await application.start((): void => {
    console.log(
      `Server started on http://${application.serverHost}:${application.serverPort}`,
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

  await application.handleRequest(request);

  assertEquals(responses[0], { body: "Hello!" });
});
