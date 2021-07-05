import { Router } from "../../../middleware/router.ts";
import { render } from "../deps.ts";
import home from "../pages/home.ts";
import { posts } from "../posts.ts";

const router = new Router();

router.get("/", (ctx) => {
  ctx.response.body = render(home({ posts }));
});

export { router };
