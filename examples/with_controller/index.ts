import { Controller } from "../../lib/controller.ts";
import { Application } from "../../mod.ts";

const application = new Application();

const controller = new Controller();

controller.get("/", (req, res) => {
  res.text("Hello");
});

application.addController(controller);

await application.start();
