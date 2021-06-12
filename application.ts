#! /usr/bin/env -S deno run --unstable --allow-net --allow-read --allow-env --import-map=import_map.json

import { Application, HttpServerNative } from "oak/mod.ts";
import { router } from "/routes/routes.ts";
import { viewEngine } from "/middlewares/view_engine.ts";
import { assets } from "/middlewares/assets.ts";
import { getPort } from "/helpers.ts";

const app = new Application({
  serverConstructor: HttpServerNative,
});

app.use(viewEngine());
app.use(assets("/assets", "./static"));
app.use(router.routes(), router.allowedMethods());

const port = getPort();

console.log(`listening on port :${port}`);

await app.listen({ port });
