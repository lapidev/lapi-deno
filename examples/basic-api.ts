// Copyright 2020 Luke Shay. All rights reserved. MIT license.

import { Lapi, RequestMethod } from "../mod.ts";

const lapi = new Lapi();

lapi.addRoute(RequestMethod.GET, "/hello", (req) => {
  req.respond({ body: "Hello!" });
});

await lapi.start(() => {
  console.log(`Server started on http://${lapi.serverHost}:${lapi.serverPort}`);
});
