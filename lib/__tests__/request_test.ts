import type { ServerRequest } from "../../deps.ts";
import { assertEquals, spy, Spy } from "../../deps_test.ts";
import { RequestMethod } from "../lapi_base.ts";
import { Request } from "../request.ts";
import { testName } from "./utils_test.ts";

Deno.test(
  {
    name: testName("Request", "json", "set header and body"),
    fn: () => {
      const request = new Request(
        { url: "/path", method: RequestMethod.GET } as ServerRequest,
        "",
      );

      request.json({ key: "value" });

      assertEquals(request.responseBody, JSON.stringify({ key: "value" }));
      assertEquals(request.getHeader("Content-type"), "application/json");
    },
  },
);

Deno.test(
  {
    name: testName("Request", "xml", "set header and body"),
    fn: () => {
      const request = new Request(
        { url: "/path", method: RequestMethod.GET } as ServerRequest,
        "",
      );

      request.xml("<tag>Hi</tag>");

      assertEquals(request.responseBody, "<tag>Hi</tag>");
      assertEquals(request.getHeader("Content-type"), "application/xml");
    },
  },
);

Deno.test(
  {
    name: testName("Request", "method", "returns the method"),
    fn: () => {
      const request = new Request(
        { url: "/path", method: RequestMethod.GET } as ServerRequest,
        "",
      );

      assertEquals(request.method, RequestMethod.GET);
    },
  },
);

Deno.test(
  {
    name: testName("Request", "queries", "returns the method"),
    fn: () => {
      const request = new Request(
        {
          url: "/path?one=valueOne&two=valueTwo",
          method: RequestMethod.GET,
        } as ServerRequest,
        "",
      );

      assertEquals(request.queries.get("one"), "valueOne");
      assertEquals(request.queries.get("two"), "valueTwo");
    },
  },
);

Deno.test(
  {
    name: testName("Request", "send", "sends json"),
    fn: () => {
      const respond = spy();
      const request = new Request(
        {
          url: "/path?one=valueOne&two=valueTwo",
          method: RequestMethod.GET,
          respond,
        } as unknown as ServerRequest,
        "",
      );

      request.json({ key: "value" }).send();

      assertEquals(
        respond.calls[0].args,
        [
          {
            body: request.responseBody,
            status: request.status,
            headers: request.headers,
          },
        ],
      );
    },
  },
);
