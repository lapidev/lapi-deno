import { Router } from "oak/mod.ts";
import { render } from "/helpers.ts";

const router = new Router();

router.get("/", (ctx) => {
  render(ctx, "index");
});

export { router };
