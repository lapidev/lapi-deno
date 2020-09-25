// Copyright 2020 Luke Shay. All rights reserved. MIT license.

import { Lapi, RequestMethod } from "../lib/mod.ts";

const app = new Lapi();

app.addRoute(RequestMethod.GET, "/hello", (req) => {
  req.respond({ body: "Hello!" });
});

await app.start(() => {
  console.log(`Server started on http://${app.serverHost}:${app.serverPort}`);
});
