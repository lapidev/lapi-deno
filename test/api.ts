// Copyright 2020 Luke Shay. All rights reserved. MIT license.

import { Application, ContentType } from "../mod.ts";

const app = new Application();

app.get(/\/hello\/(?<name>.+)/, (req, res) => {
  res.json({ message: `Hello, ${req.params.name}!` });
});

app.post("/post-endpoint/<id>", (req, res) => {
  res.setHeader("Content-type", ContentType.TextPlain);
  res.respond({ body: req.params.id });
});

app.addMiddleware((req, res) => {
  console.log("This is a middleware");
});

app.addPostware((req, res) => {
  console.log("This is a postware");
});

await app.start();
