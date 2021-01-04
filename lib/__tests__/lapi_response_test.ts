// Copyright 2020 Luke Shay. All rights reserved. MIT license.

import { assertEquals } from "../../deps_test.ts";
import { LapiResponse } from "../lapi_response.ts";
import { testName } from "./test_utils.ts";
import type { ServerRequest } from "../../deps.ts";
import { Header } from "../header.ts";
import { ContentType } from "../content_type.ts";

Deno.test({
  name: testName("LapiResponse", "constructor", "constructs"),
  fn: () => {
    const serverRequest = {
      url: "this is the url",
    } as unknown as ServerRequest;

    const lapiResponse = new LapiResponse("someid", serverRequest);

    assertEquals(lapiResponse.id, "someid");
    assertEquals(lapiResponse.url, "this is the url");
  },
});

Deno.test({
  name: testName("LapiResponse", "json", "sets body and content type header"),
  fn: () => {
    const serverRequest = {
      url: "this is the url",
    } as unknown as ServerRequest;

    const lapiResponse = new LapiResponse("someid", serverRequest);

    lapiResponse.json({ key: "a random value" });

    assertEquals(
      lapiResponse.getHeader(Header.ContentType),
      ContentType.ApplicationJson,
    );
    assertEquals(
      lapiResponse.getResponse().body,
      JSON.stringify({ key: "a random value" }),
    );
  },
});

Deno.test({
  name: testName("LapiResponse", "xml", "sets body and content type header"),
  fn: () => {
    const serverRequest = {
      url: "this is the url",
    } as unknown as ServerRequest;

    const lapiResponse = new LapiResponse("someid", serverRequest);

    lapiResponse.xml("<tag>this is some xml</tag>");

    assertEquals(
      lapiResponse.getHeader(Header.ContentType),
      ContentType.ApplicationXml,
    );
    assertEquals(
      lapiResponse.getResponse().body,
      "<tag>this is some xml</tag>",
    );
  },
});

Deno.test({
  name: testName("LapiResponse", "html", "sets body and content type header"),
  fn: () => {
    const serverRequest = {
      url: "this is the url",
    } as unknown as ServerRequest;

    const lapiResponse = new LapiResponse("someid", serverRequest);

    lapiResponse.html("<div>this is some html</div>");

    assertEquals(
      lapiResponse.getHeader(Header.ContentType),
      ContentType.TextHtml,
    );
    assertEquals(
      lapiResponse.getResponse().body,
      "<div>this is some html</div>",
    );
  },
});

Deno.test({
  name: testName("LapiResponse", "text", "sets body and content type header"),
  fn: () => {
    const serverRequest = {
      url: "this is the url",
    } as unknown as ServerRequest;

    const lapiResponse = new LapiResponse("someid", serverRequest);

    lapiResponse.text("this is some text");

    assertEquals(
      lapiResponse.getHeader(Header.ContentType),
      ContentType.TextPlain,
    );
    assertEquals(lapiResponse.getResponse().body, "this is some text");
  },
});

Deno.test({
  name: testName("LapiResponse", "setHeader", "sets the given header"),
  fn: () => {
    const serverRequest = {
      url: "this is the url",
    } as unknown as ServerRequest;

    const lapiResponse = new LapiResponse("someid", serverRequest);

    const retLapiResponse = lapiResponse.setHeader(
      "Authorization",
      "Bearer token",
    );

    assertEquals(retLapiResponse, lapiResponse);
    assertEquals(
      lapiResponse.getHeader("Authorization"),
      "Bearer token",
    );
    assertEquals(
      lapiResponse.getResponse().headers?.get("Authorization"),
      "Bearer token",
    );
  },
});
