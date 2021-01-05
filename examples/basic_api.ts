// Copyright 2020 Luke Shay. All rights reserved. MIT license.

import {
  Application,
  LapiRequest,
  RequestMethod,
  Response,
  ServerRequest,
} from "../mod.ts";
import { assertEquals } from "../deps_test.ts";
import { LapiResponse } from "../lib/lapi_response.ts";

const application = new Application({ timer: true });

application.get(
  "/hello/<name>", // Regex Equivalent: /\/hello\/(?<name>[^/?]+)/
  (request: LapiRequest, response: LapiResponse): void => {
    response.respond({ body: `Hello, ${request.params.name}!` });
  },
);

application.get(
  /\/helloreg\/(?<name>[^/?]+)/, // String Equivalent: "/helloreg/<name>"
  (request: LapiRequest, response: LapiResponse): void => {
    response.respond({ body: `Hello, ${request.params.name}!` });
  },
);

application.get(
  "/json",
  (request: LapiRequest, response: LapiResponse): void => {
    response.json({ hello: "This is JSON" });
  },
);

application.get(
  "/xml",
  (request: LapiRequest, response: LapiResponse): void => {
    response.xml("<tag>This is some XML</tag>");
  },
);

if (Deno.env.get("DENO_ENV") !== "TEST") {
  await application.start(() => {
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

  await application.handleRequest(serverRequest);

  assertEquals(responses[0], { body: "Hello!" });
});
