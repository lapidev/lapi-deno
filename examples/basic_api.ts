// Copyright 2020 Luke Shay. All rights reserved. MIT license.

import { Application } from "../mod.ts";

const application = new Application();

application.use((ctx) => {
  if (ctx.request.method === "GET") {
    ctx.response.body = { key: "value" };
  }
});

application.start();
