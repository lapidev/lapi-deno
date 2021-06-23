// Copyright 2020 Luke Shay. All rights reserved. MIT license.

import { Context } from "../context.ts";
import { assertEquals, assert } from "../deps_test.ts";
import { cors } from "./cors.ts";

function fakeContext() {
  return {
    request: {
      headers: new Headers(),
    },
    response: {
      headers: new Headers(),
    },
  };
}

Deno.test({
  name: "defaults allowed allowedOrigins to '*'",
  fn: function () {
    const ctx = fakeContext();

    cors()(ctx as Context, () => {});

    assertEquals(ctx.response.headers.get("Access-Control-Allow-Origin"), "*");
    assert(!ctx.response.headers.get("Origin"));
  },
});

Deno.test({
  name: "sets allowed allowedOrigins to the matching one from list",
  fn: function () {
    const ctx = fakeContext();

    ctx.request.headers.set("Origin", "second");

    cors({ allowedOrigins: ["first", "second", "third"] })(
      ctx as Context,
      () => {}
    );

    assertEquals(
      ctx.response.headers.get("Access-Control-Allow-Origin"),
      "second"
    );
  },
});

Deno.test({
  name: "sets allowed allowedOrigins to false when none match",
  fn: function () {
    const ctx = fakeContext();

    ctx.request.headers.set("Origin", "not matching");

    cors({ allowedOrigins: ["first", "second", "third"] })(
      ctx as Context,
      () => {}
    );

    assertEquals(
      ctx.response.headers.get("Access-Control-Allow-Origin"),
      "false"
    );
  },
});

Deno.test({
  name: "doesn't set allow credentials",
  fn: function () {
    const ctx = fakeContext();

    cors({ credentials: false })(ctx as Context, () => {});

    assert(!ctx.response.headers.get("Access-Control-Allow-Credentials"));
  },
});

Deno.test({
  name: "sets allow credentials",
  fn: function () {
    const ctx = fakeContext();

    cors()(ctx as Context, () => {});

    assertEquals(
      ctx.response.headers.get("Access-Control-Allow-Credentials"),
      "true"
    );
  },
});

Deno.test({
  name: "defaults max age to 3600",
  fn: function () {
    const ctx = fakeContext();

    cors()(ctx as Context, () => {});

    assertEquals(ctx.response.headers.get("Access-Control-Max-Age"), "3600");
  },
});

Deno.test({
  name: "defaults max age to 36000",
  fn: function () {
    const ctx = fakeContext();

    cors({ maxAge: 36000 })(ctx as Context, () => {});

    assertEquals(ctx.response.headers.get("Access-Control-Max-Age"), "36000");
  },
});
