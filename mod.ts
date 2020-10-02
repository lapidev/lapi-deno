// Copyright 2020 Luke Shay. All rights reserved. MIT license.
/* @module lapi */
import { assertEquals } from "https://deno.land/std@0.71.0/testing/asserts.ts";
import { square } from "./wasm/pkg/lapi_wasm.js";

export * from "./lib/application.ts";
export * from "./lib/lapi_error.ts";
export * from "./lib/controller.ts";
export * from "./lib/lapi_base.ts";
export * from "./lib/request.ts";

export * from "./deps.ts";

Deno.test("wasm", async () => {
  assertEquals(square(2), 4);
});
