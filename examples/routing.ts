// Copyright 2020 Luke Shay. All rights reserved. MIT license.

import { Application } from "../mod.ts";
import { Router } from "../middleware/router.ts";
import { cors } from "../middleware/cors.ts";

const application = new Application();
const router = new Router();

router.get("/", (ctx) => {
  ctx.response.body = { key: "value" };
});

router.get("/hello/:name", (ctx) => {
  ctx.response.body = `Hello, ${ctx.request.pathParams.name}!`;
});

application.use(cors()).use(router.routes()).start();
