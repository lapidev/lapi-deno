// Copyright 2020 Luke Shay. All rights reserved. MIT license.

import { Application } from "../mod.ts";
import { Router } from "../middleware/router.ts";

const application = new Application();
const router = new Router();

router.use("GET", "/", (ctx) => {
  ctx.response.body = { key: "value" };
});

application.use(router.routes()).start();
