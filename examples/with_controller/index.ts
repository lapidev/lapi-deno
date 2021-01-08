import { Controller } from "../../lib/controller.ts";
import { Application } from "../../mod.ts";

const application = new Application({ basePath: "/api" });

const controller = new Controller({ basePath: "/v1" });

controller.get("", (req, res) => {
  res.text("Hello");
});

application.addController(controller);

await application.start();
