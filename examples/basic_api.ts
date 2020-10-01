// Copyright 2020 Luke Shay. All rights reserved. MIT license.

import {
  Application,
  RequestMethod,
  ServerRequest,
  Request,
  Response,
} from "../mod.ts";
import { assertEquals } from "https://deno.land/std@0.70.0/testing/asserts.ts";

const application = new Application({ timer: true });

application.get("/hello", (request: Request): void => {
  request.send({ body: "Hello!" });
});

application.get("/json", (request: Request): void => {
  request.json({ hello: "This is JSON" }).send();
});

application.get("/xml", (request: Request): void => {
  request.xml("<tag>This is some XML</tag>").send();
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

  const serverRequest = {
    method: RequestMethod.GET,
    url: "/hello",
    respond: (res: Response) => {
      responses.push(res);
    },
  } as unknown as ServerRequest;

  const request = new Request("asdf", serverRequest, "");

  await application.handleRequest(request);

  assertEquals(responses[0], { body: "Hello!" });
});
