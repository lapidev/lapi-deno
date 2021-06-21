// Copyright 2020 Luke Shay. All rights reserved. MIT license.

import { Application } from "../mod.ts";
import { Router } from "../middleware/router.ts";

const application = new Application();
const router = new Router();

router.use("GET", "/", (ctx) => {
  ctx.response.body = { key: "value" };
});

router.use("GET", "/hello/<name>", (ctx) => {
  ctx.response.body = `Hello, ${ctx.request.pathParams.name}!`;
});

application.use(router.routes()).start();
