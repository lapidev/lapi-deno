import { Application, ContentType } from "../mod.ts";

const app = new Application();

app.get(/\/hello\/(?<name>.+)/, (req) => {
  req.json({ message: `Hello, ${req.params.name}!` }).send();
});

app.post("/post-endpoint/<id>", (req) => {
  req.setHeader("Content-type", ContentType.TEXT_PLAIN);
  req.send({ body: req.params.id });
});

app.start();
