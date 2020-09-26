// Copyright 2020 Luke Shay. All rights reserved. MIT license.

import { Lapi } from "../mod.ts";

const lapi = new Lapi();

lapi.get("/hello", (req): void => {
  req.respond({ body: "Hello!" });
});

await lapi.start((): void => {
  console.log(`Server started on http://${lapi.serverHost}:${lapi.serverPort}`);
});
