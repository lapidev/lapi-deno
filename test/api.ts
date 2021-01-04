// Copyright 2020 Luke Shay. All rights reserved. MIT license.

import { Application, ContentType } from "../mod.ts";

const app = new Application();

app.get(/\/hello\/(?<name>.+)/, (req, res) => {
  res.json({ message: `Hello, ${req.params.name}!` }).send();
});

app.post("/post-endpoint/<id>", (req, res) => {
  res.setHeader("Content-type", ContentType.TextPlain);
  res.send({ body: req.params.id });
});

await app.start();
