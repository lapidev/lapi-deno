// Copyright 2020 Luke Shay. All rights reserved. MIT license.

import { Application, ContentType } from "../mod.ts";

const app = new Application();

app.get(/\/hello\/(?<name>.+)/, (req) => {
  req.json({ message: `Hello, ${req.params.name}!` }).send();
});

app.post("/post-endpoint/<id>", (req) => {
  req.setHeader("Content-type", ContentType.TextPlain);
  req.send({ body: req.params.id });
});

await app.start();
