import { Application } from "../../mod.ts";
import { assets } from "../../middleware/assets.ts";
import { cors } from "../../middleware/cors.ts";
import { findPost, posts } from "./posts.ts";
import { render } from "./deps.ts";
import { Router } from "../../middleware/router.ts";
import home from "./pages/home.ts";
import post from "./pages/post.ts";

const application = new Application();
const router = new Router();

router.use("GET", "/", async (ctx) => {
  ctx.response.body = render(home({ posts }));
});

router.use("GET", "/post/<id>", async (ctx) => {
  const thePost = findPost(ctx.request.pathParams.id);

  if (thePost) {
    ctx.response.body = render(post({ post: thePost }));
  }
});

application
  .use(cors())
  .use(await assets("/assets", "./assets"))
  .use(router.routes())
  .start();
